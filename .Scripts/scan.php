<?php

// Recursively searches directory for video files and moves them to download location
function remove_non_av($dir, $destination){
    if(is_dir($dir)){
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != '.' && $object != '..' && $object != 'index.php'){
                if (is_file("$dir/".$object)){

                    // Get MIME type
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mime = finfo_file($finfo, "$dir/".$object);
                    if (!(strpos($mime, 'video') !== false) && !(strpos($mime, 'audio') !== false)) {
                        unlink($dir.'/'.$object);
                    } else {

                        // This automatically converts non mp4 files to mp4 -- takes a while so disabled
                        // TODO: add as option to convert files when user prompts to do so?
                        
                        //$type_check_array = explode('.',$object);
                        //if (end($type_check_array) == 'mkv'){
                        //    $type_check_array = array_slice($type_check_array, 0, -1);
                        //    $object_new = implode('.',$type_check_array);
                        //    shell_exec("ffmpeg -i '".$dir.'/'.$object."' -c copy -movflags +faststart '/var/www/media.bryceyoder.com$destination/$object_new.mp4' &");
                        //    unlink($dir.'/'.$object);
                        //    rename($dir.'/'.$object_new.'.mp4', '/var/www/media.bryceyoder.com'.$destination.'/'.$object_new.'.mp4');
                        //} else { rename($dir.'/'.$object, '/var/www/media.bryceyoder.com'.$destination.'/'.$object_new); }

                        $new_dest = '/var/www/media.bryceyoder.com'.$destination.'/'.rawurlencode($object).'.mp4';
                        rename($dir.'/'.$object, $new_dest); 
                    }
                } else { remove_non_av($dir.'/'.$object, $destination); }
            }
            reset($objects);
        }
    }
}

// Run in the background and listen for download events
exec('aria2c --enable-rpc --rpc-allow-origin-all -D -V');
$locations = [];
include 'Aria2.php';
$aria2 = new Aria2();

while(True){
    $aria2->purgeDownloadResult();
    $in_progress = "";

    // We store download locations as array values with the GID as a key. Aria2 changes GID sometimes for some reason, so we update the array every passthrough.
    // To keep the array from growing infinitely large, we set all values to be deleted before going through the active downloads
    foreach ($locations as $gid => $value){
        $locations[$gid][1] = 0;
    }

    // This is under test... Not sure if this will work well or not.
    // TODO: Add pause function
    $active = $aria2->tellActive(["status","gid","dir","completedLength","totalLength","uploadSpeed","verifiedLength"]); 
    $waiting = $aria2->tellWaiting(["status","gid","dir","completedLength","totalLength","uploadSpeed","verifiedLength"]); 
    $stopped = $aria2->tellStopped(["status","gid","dir","completedLength","totalLength","uploadSpeed","verifiedLength"]); 

    //foreach ($aria2->tellActive(["status","gid","dir","completedLength","totalLength","uploadSpeed","verifiedLength"])['result'] as $result){
   // if (!count(array_merge($active, $waiting, $stopped)['result'])) {
   //     exec("rm -r ../.Partial/*");
   //     exec("touch ../.Partial/downloads");
   // }

    foreach (array_merge($active, $waiting, $stopped)['result'] as $result){

        $gid = $result['gid'];
        $dir = $result['dir'];
        $status = $result['status'];
        print_r($status);
        print_r($result);

        // When deletion is triggered, it creates a file as "directoryname.downloadGID".
        // Check if this file exists, and if so, remove download from Aria2 and clean up files
        if (file_exists("$dir.$gid")){
            $aria2->remove($gid);
            exec("rm -r '$dir'");
            unset($locations[$gid]);
            unlink("$dir.in_progress");
            unlink("$dir.$gid");
            continue;
        }

        // Calculate dl percentage
        $amount_done = $result['completedLength'];
        $total = $result['totalLength'];
        $percent = round($amount_done / $total, 2) * 100;

        if ($percent == 100) {
            unlink("$dir.in_progress");
            exec("chown -R www-data:www-data '$dir'");
            remove_non_av($dir, $locations[$gid][0]);
            unset($locations[$gid]);
            $aria2->remove($gid); 
            exec("rm -r '$dir'");
            continue;
        }

        // Add GID:Directory to array and update value to 1 to prevent deletion
        $file_contents = file_get_contents("$dir.in_progress");
        $file_contents = explode("\n", $file_contents);
        $location = $file_contents[1];
        $locations[$gid] = array($location, 1);

        if ((disk_free_space('/') - $total) < 1000) {
            exec("rm -r '$dir'*");
            $in_progress = $in_progress."$dir|$gid|This download has been canceled due to lack of disk space.\n";
        } else {
            $in_progress = $in_progress."$dir|$gid|$percent\n";
        }

    }

    // Delete all non-updated keys
    foreach ($locations as $gid => $value){
        if ($locations[$gid][1] == 0){
            unset($locations[$gid]);
        }
    }

    // The Downloads page displays info by reading this file
    // Output information so Downloads can display it
    exec("echo '$in_progress' > ../.Partial/downloads");
    $objects = scandir("../.Partial");

    // Downloads are started by a .start file containing download location, magnet link, etc. Scan the directory for .start files
    // and initialize the downloads when found.
    foreach ($objects as $object) {
        if($object != '.' && $object != '..' && is_dir("../.Partial/$object")){
            if (file_exists("../.Partial/$object.start")){
                $file_contents = file_get_contents("../.Partial/$object.start");
                $file_contents = explode("\n", $file_contents);
                exec("mv '../.Partial/$object.start' '../.Partial/$object.in_progress'");
                $aria2->addUri(
                    [$file_contents[0]],
                    [
                        'checkIntegrity'=>true,
                        'realtime-chunk-checksum'=>true,
                        'dir'=>"/var/www/media.bryceyoder.com/.Partial/$object",
                        'seed-time'=>0
                    ]
                );
            }
        }
    }
    sleep(5);
}

?>
