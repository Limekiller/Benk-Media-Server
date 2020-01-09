# Benk-Media-Server
Media server webapp built on LAMP that stores, downloads, streams, and allows the upload of audio and video.

To begin:

aria2, ffmpeg, php-xml, and php-gd must be installed

scan.php must be given the correct full path to run Aria2 on multiple lines and run in the background (php benk-media-server/.Scripts/scan.php 2>&1 /dev/null &)

To allow upload of bigger files, edit php.ini

And make sure to chown -R www-data:www-data and chmod -R 755 the install location!



Goals:

- Remember file view between pages

- Allow users to rename directories (currently can only rename files)

- Allow users to delete multiple files at a time

- Improve music player (album art, skip buttons?)

- Possibly create a Desktop app to go with it? (Probs not)
