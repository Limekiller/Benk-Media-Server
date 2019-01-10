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
            echo "<a id='dbmo' class='dir-box' href='./".$file_orig."/'>$file</a>";
        } else if ($file == "TV") {
            echo "<a id='dbtv' class='dir-box' href='./".$file_orig."/'>$file</a>";
        } else if ($file == "Music") {
            echo "<a id='dbmu' class='dir-box' href='./".$file_orig."/'>$file</a>";
        } else {echo "<a class='dir-box' href='./".rawurlencode($file_orig)."/'>".rawurldecode($file)."</a>";}
        
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
                echo "<div class='view-tog'>
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
                $vid_id += 1;
                echo "<div id='vid$vid_id' class='video-container'></div>
                        <div class='item-container'>
                        <span id='span_fileitem$vid_id' class='span_fileitem'></span>
                        <div id='fileitem$vid_id' $color onclick='play($vid_id, \"".rawurlencode($file)."\", \"name\")' class='file-item' >
                            <a class='item-del' href=\"?itemdel=".rawurlencode($file)."\">X</a>
                            <div class='item-ren'>A</div>
                            <p class='fip $cutoff'>".rawurldecode($file_new)."</p>
                        </div>
                      </div>";
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
    $file = $prefix.rawurlencode($file).'.mp4';
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
        }
    
        //Verify that the file is audio or video
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $files['tmp_name'][$f]);
        if (!(strpos($mime, 'video') !== false) && !(strpos($mime, 'audio') !== false)) {
            $file_upload = 0;
            echo "<div class='notify'>This server only supports audio and video files.</div>"; 
        }
    
        if ($file_upload == 1) {
            if (move_uploaded_file($files["tmp_name"][$f], $target_file)){
                echo "<div class='notify'>Your file was uploaded successfully!</div>";
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
            $margin = strlen($l) * 7;
            if ($margin > 75){
                $margin = "style='margin-right:".($margin/2)."px;margin-left:".$margin."px;'";
            }
            $l_repl = str_replace("~"," ",$l);
            echo "<a $margin class='bc_c' href='".$b."/'>
                        <div class='breadcrumb'></div>
                        <div class='breadcrumb-title'>".rawurldecode(rawurldecode($l_repl))."</div>
                  </a>";
            $b .= '/';
        }
    }
}

function get_metadata($term){
    $cache = file('metadata.log');
    for ($i = 0; $i < count($cache); $i++){
        if (strpos($cache[$i], $term) !== false){
            echo $cache[$i+1];
            return;
        } 
    } 

    $ch1 = strtolower($term[0]);
    $jsonurl = "http://sg.media-imdb.com/suggests/".$ch1."/".$term.".json";
    $json = file_get_contents($jsonurl);
    $start_char = 0;
    
    for ($i = 0; $i < strlen($json); $i++){
        if ($json[$i] != '{'){
            $start_char++;
        } else {
            break;
        }
    }
    $json = substr($json, $start_char, strlen($json)-$start_char-1);

    if (strpos($json, '"d"') == false){
        echo $json;
        return;
    }

    exec("echo ".escapeshellarg($term).'"\n"'.escapeshellarg($json)." >> metadata.log");
    echo $json;
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
    get_metadata($_POST['term_q']);
}
if (isset($_POST['imdbid_q'])){
    get_description($_POST['imdbid_q']);
}
?>
