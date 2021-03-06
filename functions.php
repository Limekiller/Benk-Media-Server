<?php
function list_dirs() {
//List all directories in a location
    $files = array_filter(glob('*'), 'is_dir');
    foreach($files as $file) {
        $file_orig = $file;
        $file = str_replace("~"," ",$file);
        echo "<div class='box-container'>
                <div class='box-del' id=\"./?boxdel=".rawurlencode($file_orig)."\">X</div>";
        if ($file == "Movies"){
            echo "<a id='dbmo' class='dir-box' href='./".$file_orig."/'><span>$file</span></a>";
        } else if ($file == "TV") {
            echo "<a id='dbtv' class='dir-box' href='./".$file_orig."/'><span>$file</span></a>";
        } else if ($file == "Music") {
            echo "<a id='dbmu' class='dir-box' href='./".$file_orig."/'><span>$file</span></a>";
        } else {echo "<a class='dir-box' href='./".rawurlencode($file_orig)."/'><span>".rawurldecode($file)."</span></a>";}
        
        echo "</div>";
    }
}
function list_files() {
//List all files in a location
    $files = array_diff(scandir('.'), array('.','..','index.php'));
    if (empty($files)){
        echo '<div class="file-container">';
        echo "<h3 style='margin:0 auto;margin-top:15vh;'>There's nothing here! Why not add some files?</h3>";
        echo '</div>';
        return;
    }
    $vid_id = 0;
    $current_letter = '-';
    $vid_errors = file($_SERVER["DOCUMENT_ROOT"]."/.Scripts/video_validation.log");
    foreach($files as $file) {
        if (is_file($file)){
            foreach ($vid_errors as $line) {
                if ( strpos($line, $file) !== false){
                    if (explode("|", $line)[1] == "0\n"){
                        $color = 'style=\'color:orange;\'';
                    } else {
                        $color = 'style=\'color:red;\'';
                    }
                    break;
                } else {
                    $color = 'style=\'color:black;\'';
                }
            }
            if ($current_letter == '-'){
                echo "<div class='view-tog view-tog-v'>
                        <div class='view-tog-bar'></div>
                        <div class='view-tog-bar'></div>
                        <div class='view-tog-bar'></div>
                        <div class='view-tog-bar'></div>
                    </div>";
                echo "<div class='letter-head-tog'>abc</div>";
                echo '<div class="file-container">';
            }
            if (strtolower(substr($file, 0, 1)) != strtolower($current_letter)){
                $current_letter = substr($file, 0, 1);
                echo "<div id='".strtolower($current_letter)."' class='letter-head'>".strtoupper($current_letter)."</div>";
            } 
            $file_new = explode(".",$file);
            array_pop($file_new);
            $cutoff = '';
            $file_new = implode(".",$file_new);
            if (strpos($file_new, '%20') == false && strpos($file_new, '-') == false){
                $cutoff = 'fade-out'; 
            }
            {
                $vid_id += 1; ?>
                    <div class='item-container item-container-art tooltip'>
                    <div id='fileitem<?php echo $vid_id; ?>' <?php echo $color; ?> filename='<?php echo rawurlencode($file); ?>' type='name' class='file-item file-item-art' >
                        <!--<div class='item-ren item-v'>
                            <i class="fas fa-font"></i>
                        </div>-->
                        <p class='fip <?php echo $cutoff?>'><?php echo rawurldecode($file_new)?></p>
                        <div class='loading' style='display:inherit;'></div>
                    </div>
                </div>
            <?php
            }
        }
    }
    echo '</div>';
}

function create_dir($dir_name) {
    mkdir('./'.rawurlencode($dir_name), 0777, true);
    copy('./index.php', './'.rawurlencode($dir_name).'/index.php');
}

function change_name($prefix, $file, $name){
    $file = rawurldecode($prefix).rawurldecode($file);
    $name = $name.'.mp4';
    $path = array_slice(explode('/',$file), 0, -1);
    $path = implode('/',$path).'/'.rawurlencode($name);
    rename('.'.$file, '.'.$path);
}

function add_file($files, $file_name) {
//Upload a file via the browser
    if ($files['name'][0] == ''){
            echo "<div class='notify'>Please select a file to upload.</div>";
            return false;
    }
    foreach ($files['name'] as $f => $name){
        if ($file_name == ""){
            $new_file_name = $name;
        } else {$new_file_name = $file_name;}
        $imageFileType = strtolower(pathinfo($name,PATHINFO_EXTENSION));
        $target_file = "./".rawurlencode($new_file_name).".".$imageFileType;
        $file_upload = 1;
    
        //Check if already exists
        if (file_exists($target_file)) {
            echo "<div class='notify'>Sorry, file already exists.</div>";
            $file_upload = 0;
            return false;
        }
    
        //Verify that the file is audio or video
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $files['tmp_name'][$f]);
        if (!(strpos($mime, 'video') !== false) && !(strpos($mime, 'audio') !== false)) {
            $file_upload = 0;
            echo "<div class='notify'>This server only supports audio and video files.</div>"; 
            return false;
        }
    
        if ($file_upload == 1) {
            if (move_uploaded_file($files["tmp_name"][$f], $target_file)){
                echo "<div class='notify'>Your file was uploaded successfully!</div>";
                return true;
            }
        }
    }
}
function removedir($dir){
//Remove directories and contents recursively
    if(is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != '.' && $object != '..') {
                (filetype($dir . '/' . $object) == 'dir') ? removedir($dir.'/'.$object):unlink($dir.'/'.$object);
            }
        }
        reset($objects);
        rmdir($dir);
    }
}
function breadcrumbs(){
//Generate a breadcrumb naviagtion trail
    echo "<a id='bch' class='bc_c' href='/'>
                <div class='breadcrumb'>
                    <img style='width:70%;transform:rotate(-45deg);margin-top:6px;margin-left:5px;' src='/.Images/home.svg'></img>
                </div>
                <div style='margin-top:10px;'></div>
          </a>";
    //Get the current URI as a string and split it by /, so you get each page individually
    $url = $_SERVER["REQUEST_URI"];
    if($url != '' && $url != '/'){
        $b = '';
        $links = explode('?',$url);
        $links = explode('/',rtrim($links[0],'/'));
        $count = count($links);
        foreach($links as $index => $l){
            $b .= $l;
            if (--$count <= 0){
                break;
            }
            if (substr($b, -1) == '/' || $index == 0){
                $b .= '/';
                continue;
            }
            $margin = (strlen($l) * 3) + 25;
            $margin = "style='margin-right:".$margin."px;margin-left:".$margin."px;'";
            $l_repl = str_replace("~"," ",$l);
            echo "<a $margin class='bc_c' href='".$b."/'>
                        <div class='breadcrumb'></div>
                        <div class='breadcrumb-title'>".rawurldecode(rawurldecode($l_repl))."</div>
                  </a>";
            $b .= '/';
        }
    }
}

function get_metadata($term, $old_term){

    $cache = fopen('metadata.log', 'r');
    if ($cache) {
        $matches = false;
        while (($line = fgets($cache)) !== false) {
            if ($matches) {
                print_r(json_encode([$line, 1]));
                fclose($cache);
                return;
            }

            if ($line == $term."\n") {
                $matches = true;
            }
        }
    }

    $ch1 = strtolower($term[0]);
    $jsonurl = "http://sg.media-imdb.com/suggests/".$ch1."/".$term.".json";
    $json = json_decode(substr(strstr(file_get_contents($jsonurl), '{'), 0, -1), true);
    $json_result = null;
    foreach ($json["d"] as $movie) {
        if (strtolower($movie['l']) == strtolower($term)) {
            $json_result = $movie;            
            break;
        }
    }

    if ($json_result == null) {
        $json_result = $json["d"][0];
    }

    error_log(escapeshellarg($term));
    if ($json_result != null && !exec('grep '.escapeshellarg($term).'\n metadata.log')) {
        $location = escapeshellarg('.Images/cache/'.$term.'.jpg');
        exec("wget -O $location ".$json_result['i'][0]." &");
        $location = '.Images/cache/'.$term.'.jpg';

        // Cut the image size in half and compress it to 90%
        list($width, $height) = getimagesize($location);
        $new_width = $width / 2;
        $new_height = $height / 2;
        $thumb = imagecreatetruecolor($new_width, $new_height);
        $source = imagecreatefromjpeg($location);
        imagecopyresized($thumb, $source, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

        if ($old_term) {
            imagejpeg($thumb, '.Images/cache/'.$old_term.'.jpg', 90);
            exec("echo ".escapeshellarg($old_term).'"\n"'.escapeshellarg(json_encode($json_result)).">> metadata.log");
        } else {
            imagejpeg($thumb, '.Images/cache/'.$term.'.jpg', 90);
            exec("echo ".escapeshellarg($term).'"\n"'.escapeshellarg(json_encode($json_result)).">> metadata.log");
        }
    }

    print_r(json_encode([json_encode($json_result), 0]));
}

function get_description($id) {
    libxml_use_internal_errors(true);
    $html = file_get_contents('https://imdb.com/title/'.$id);
    $doc = new DOMDocument();
    if(!empty($html)){
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        $links = $xpath->query('//div[@class="summary_text"]');
        $link = $links[0]->textContent;
    }
    echo $link;
}

if (isset($_POST['dest'])){
    if (count(explode("/", rawurldecode($_POST['source']))) > 2){
        $end_dest = end(explode("/", rawurldecode($_POST['source'])));
    } else {$end_dest = rawurldecode($_POST['source']);}
    rename('.'.rawurldecode($_POST['source']),'.'.rawurldecode($_POST['dest']).'/'.$end_dest);
}
if (isset($_POST['file_q'])){
   change_name($_POST['file_prefix_q'], $_POST['file_q'], $_POST['name_q']); 
}
if (isset($_POST['term_q'])){
    if (isset($_POST['term_old'])) {
        get_metadata($_POST['term_q'], $_POST['term_old']);
    } else {
        get_metadata($_POST['term_q'], null);
    }
}
if (isset($_POST['imdbid_q'])){
    get_description($_POST['imdbid_q']);
}
?>
