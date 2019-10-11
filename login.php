<?php
ini_set('session.cookie_lifetime', 60 * 60 * 24);
session_start();
    error_log($_SESSION['logged_in']);
    if (isset($_SESSION['logged_in']) && ($_SESSION['logged_in'] == 1)){
        header("Location: /");
    }
    if (isset($_POST['pw'])){
        if ($_POST['pw'] == 'PotHouse2019!'){
            $_SESSION['logged_in'] = 1;
            error_log($_SESSION['logged_in']);
            header("Location: /");
        }
    }
?>
<html>
<head>
    <title>Benk Media Server</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8"> 
    <link rel="stylesheet" href="/login_style.css">
</head>
<body>
<div id='logo-container'>
    <div id='play-bar'></div>
    <div id='play-container'></div>
    <div id='play'></div>
    <img id='logo' src='/.Images/benk_logo_text.svg'/>
</div>
<div id='login-container'>
    <form action="" method="post">
        <input type="password" name="pw"><br>
        <input type="submit" value="Submit">
    </form>
</div>
</body>
</html>
