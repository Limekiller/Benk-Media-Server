<?php
function binary_insert($arr, $val){
    if (count($arr) == 1){
        return $arr[0];
    }
    $mid = $arr[intdiv(count($arr),2)-1][2];
    if (count($arr) == 2){
        if ($mid < $val[2]){
            return $arr[0];
        } else {
            return $arr[1];
        }
    }
    if ($mid < $val[2]){
       $item = binary_insert(array_slice($arr, 0, intdiv(count($arr),2)), $val); 
    } else { 
       $item = binary_insert(array_slice($arr, intdiv(count($arr),2)+1), $val); 
    } 
    return $item;
}

function search($dir, $term, $arr){
    $objects = scandir($dir);
    $results = $arr;
    $term_arr = explode("%2520", $term);
    foreach ($objects as $object) {
        if ($object != '.' && $object != '..' && $object != '.Fonts' && $object != '.Images' && $object != '.git' && $object != '.Scripts' && $object != '.Partial' && strpos($object, '.php') !== true){
            if (is_file("$dir/".$object)){
                $relevant = 0;
                if (strpos(strtolower("$dir/".rawurlencode($object)), strtolower($term))){
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mime = finfo_file($finfo, "$dir/".$object);
                    if (!(strpos($mime, 'video') !== false) && !(strpos($mime, 'audio') !== false)) {
                        continue;
                    } else {
                    $relevant += 1;
                    }
                }
                $item_arr = explode(".",rawurlencode($object));
                array_pop($item_arr);
                $object = implode('.',$item_arr);
                $item_arr = explode("%2520",$object);
                foreach($item_arr as $word){
                    if (in_array(strtolower($word), array_map("strtolower", $term_arr))){
                        $relevant += 1;
                    }
                }
                $object = $object.".mp4";
                if ($relevant > 0){
                    $val = array(rawurldecode($object), "$dir/".$object, $relevant);
                    if (count($results) == 0 || $relevant < end($results)[2]){
                        array_push($results, $val); 
                    } else if ($relevant >= ($results)[0][2]){
                        array_unshift($results, $val);
                    } else if (count($results) == 1) {
                        if ($results[0][2] < $relevant){
                            array_unshift($results, $val);
                        } else {
                            array_push($results, $val);
                        }
                    } else {
                        $index_to_replace = array_search(binary_insert($results, $val),$results);
                        array_splice($results, array_search(binary_insert($results, $val),$results), 0, array($val));
                    }
                }
    //print_r($results);
            } else {$results = search("$dir/".$object, $term, $results);}
        }
    }
    return $results;
}
?>
<!DOCTYPE HTML>
<html>
<head>
    <title>Benk Media Server</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8"> 
    <link rel="stylesheet" href="/style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="http://vjs.zencdn.net/6.6.3/video.js"></script>
    <link href="http://vjs.zencdn.net/6.6.3/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="/video-js.css">
    <script src=".Scripts/add.js"></script>
    <script src=".Scripts/tor.js"></script>
</head>
<body>
    <form class='search-form' action='search.php' >
        <input type='text' name='search'><br /><br />
        <input type='submit' value='Search'></form>
    <div class='search-button'></div><br />
    <a id="bch" class="bc_c" href="/">
    <div id='dbc' class="breadcrumb">
        <img style="width:70%;transform:rotate(-45deg);margin-top:6px;margin-left:5px;"src="/.Images/home.svg">
    </div>
    </a>
    <h1 style='padding-left:50px;'>Search Results</h1>

<?php 
if(isset($_GET['search'])){
    echo "<div class='file-container'>";
   $results = search('.',rawurlencode(rawurlencode($_GET['search'])),array());
   $vid_id = 0;
   foreach ($results as $result){
        $file_new = str_replace('~',' ',$result[0]);
        $file_new = explode(".",$file_new);
        array_pop($file_new);
        $file_new = implode(".",$file_new);
        $vid_id += 1;
        echo "<div id='vid$vid_id' class='video-container'></div>
                <div class='item-container'>
                <div onclick='play($vid_id, \"$result[1]\", \"path\")' class='file-item' >".rawurldecode($file_new)."</div>
              </div>";
   }
   echo "</div>";
}
?>
</body>
</html>
