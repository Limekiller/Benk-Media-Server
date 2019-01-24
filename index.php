<?php 
ini_set('session.cookie_lifetime', 60 * 60 * 24);
session_start();
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] != 1){
        header("Location: /login.php");
    }
    $dir = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $functions = $_SERVER['DOCUMENT_ROOT']."/functions.php"; 
    $del = 1;
    include_once($functions);
    if (isset($_GET['rena'])){
        rename($_GET['rena']);
        header('Location: '.$dir);
    }
    if (isset($_GET['dn'])) {
        create_dir($_GET['dn']);
        header('Location: '.$dir);
    }
    if (isset($_POST['fn'])){
       $del = 0;
       add_file($_FILES['uf'],$_POST["fn"]);
        
    }
    if (isset($_GET['itemdel'])) {
        $item = $_GET['itemdel'];
        $item = str_replace(" ","~",$item);
        unlink('./'.$_GET['itemdel']);
        header('Location: '.$dir.'?del=1');
    }
    if (isset($_GET['itemdl'])) {
        $item = $_GET['itemdl'];
        $item = str_replace(" ","~",$item);
        header("Content-Disposition: attachment; filename=" . basename($item));
        header("Content-Length: " . filesize($item));
        header("Content-Type: application/octet-stream;");
        readfile($item);
    }
    if (isset($_GET['boxdel'])) {
        removedir($_GET['boxdel']);
        header('Location: '.$dir);
    }
    if (isset($_GET['del']) && $del == 1) {
        echo "<div class='notify'>Your file was deleted successfully.</div>";
    }
?>
<!DOCTYPE html>
<html>
<head>
    <title>Benk Media Server</title>
    <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1">
    <meta charset="UTF-8"> 
    <link rel="stylesheet" href="/style.css">
    <script src="https://cdn.jsdelivr.net/webtorrent/latest/webtorrent.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <link href="http://vjs.zencdn.net/6.6.3/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="/video-js.css">
    <script src="/.Scripts/add.js"></script>
    <script src="/.Scripts/tor.js"></script>
</head>
<body>
    <?php
        if ($dir != "/"){
            echo "<div class='mobile-bc-tog'>. . .</div>";
            echo "<div class='breadcrumbs'>";
                            breadcrumbs();
            echo "<a href='..'>
                    <div class='back'>
                    <img src='/.Images/back.svg'/>
                </div></div></a>
            </div>";
            $dir_name = str_replace("~"," ",basename(__DIR__));
            echo "<h1 class='page_title'>".rawurldecode($dir_name)."</h1>";
        } else {
                echo "<form class='search-form' action='search.php' >
                        <input type='text' name='search'><br /><br />
                        <input type='submit' value='Search'></form>";
                $dt = round(disk_total_space("/")/1000000000,1);
                $df = round(disk_free_space("/")/1000000000,1);
                if (($dt - $df) >= ($dt * 0.9)){
                    $space_warning = "style='color:#d00;'";
                } else { $space_warning = ""; }
                echo "<p $space_warning id='ds1'>".($dt - $df)."GB</p><p $space_warning id='ds2'>/".$dt."GB</p>
                <div class='search-button'></div>
                <img class='logo' src='/.Images/benk_logo.svg' />";}
        
    ?>
    <div class="dir-container">
        <?php 
            list_dirs(); 
        ?>
    </div>
    <?php if ($dir != "/"){
        list_files(0);
    }
?>
    </div>
    <div class="menu-container">
        <div class="new-menu">
            <ul>
                <li id='cnd'> Create new directory </li> 
                <?php if ($dir != "/"){
                    echo "<li id='dnf'> Download media</li>
                    <li id='um'> Upload media </li>";
                }?>
            </ul>
        </div>
        <div id='sm-hover'>
        <div class="st-button sm-buttons-in">
            <img style='width:60%;margin-top:8px;' src='/.Images/stream.svg' />
        </div>
        <a href="/downloads.php" class="dl-button sm-buttons-in">
            <img style='width:60%;margin-top:8px;' src='/.Images/dl.svg' />
        </a>
        </div>
        <div class="new-button">
            <img style='margin-left:15px;margin-top:15px;width:60%;height:60%;' src='/.Images/plus.png' />
        </div>
    </div>
    <?php if ($dir != "/"){ echo "
    <div class=\"dnf_container\">
        <div class=\"dnf\">
            <div id='dnfc' class=\"close\">X</div>
            <div class='t-chooser'>
                <div id='tc1' class='t-choice t-choice-active'></div>
                <div id='tc2' class='t-choice'></div>
            </div>
            <h2>Download New Media</h2>
            <h3>Title</h3>
            <input type=\"text\" name=\"dn\" id=\"dn\"><br />
            <button id='dnb' onclick=\"get_results('dl')\" >Search</button> 
            <div id='result_container'>
            </div>
        </div>
    </div>
    <div class=\"um_container\">
        <div class=\"um\">
            <div id='umc' class=\"close\">X</div>
            <h2>Upload Media</h2>
            <form id=\"um_form\" method=\"post\" enctype=\"multipart/form-data\">
                <h3 id='file_name_label'>File Name</h3>
                <input id='file_name' type=\"text\" name=\"fn\"><br>
                <h3>Upload File</h3>
                <div class=\"fsubmit\">
                    <input type=\"file\" multiple=\"multiple\" name=\"uf[]\">
                </div>
                <input id='f_upload_s' type=\"submit\" value=\"Submit\">
            </form>
        </div>
    </div>";}?>
    <div class="um_cover">
        <div class="loading"></div>
        <h1>Uploading...</h1>
    </div>
    <div class="snf_container">
        <div class="snf">
            <div id='snfc' class="close">X</div>
            <h2>Stream Media</h2>
            <h3>Title</h3>
            <input type="text" name="dn" id="sn"><br />
           <button id='snb' onclick='stream()'>Search</button> 
            <div id='sresult_container'>
            </div>
        </div>
    </div>
    <div class="cnd_container">
        <div class="cnd">
            <div id='cndc' class="close">X</div>
            <h2>Create New Directory</h2>
            <form id="cnd_form" >
                <h3>Directory Name</h3>
                <input type="text" name="dn"><br><br>
                <input type="submit" value="Submit">
            </form>
        </div>
    </div>
    <div class="dd_container">
        <div class="dd">
            <h2>Are you sure you want to delete this directory?</h2>
            <div id="dds_container">
                <div id='dd_submit'></div>
                <div style="width:50px;display:inline-block;"></div>
                <button id='ddc'>No</button>
            </div>
        </div>
    </div>
    <div class="ren_container">
        <div class="ren">
            <div id='renc' class="close">X</div>
            <h2>Change name to:</h2>
            <div id="rena_form">
                <input type="text" id="rena"><br><br>
                <button id='renas' >Submit</button>
            </div>
        </div>
    </div>
</body>
</html>
