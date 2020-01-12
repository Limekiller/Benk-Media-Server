<?php
session_start();
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] != 1){
        header("Location: /login.php");
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
    <script src=".Scripts/dashboard.js"></script>
</head>
<body>
    <a id="bch" class="bc_c" href="/">
        <div id='dbc' class="breadcrumb">
            <img style="width:70%;transform:rotate(-45deg);margin-top:6px;margin-left:5px;"src="/.Images/home.svg">
        </div>
    </a>
    <h1 style='padding-left:100px;'>Downloads</h1>
    <div id='dl_container'></div>
</body>
</html>
    

