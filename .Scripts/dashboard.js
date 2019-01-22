var progressRefresh;
// Refresh results every 5 seconds
$(window).bind("load", function refresh_wait(){
    refresh();
    progressRefresh = setInterval(refresh, 5000);
});

// Cancels a downloading torrent
function cancel(gid, name){
    console.log(gid);
    clearInterval(progressRefresh);
    setTimeout(function() {
        refresh();
        progressRefresh = setInterval(refresh, 5000);
    }, 10000);
    $('#'+gid).addClass("canceled");
    $.ajax({
        url : '.Scripts/dashboard.php',
        data: {gid_post: gid, name_post: name},
        type: "POST",
        context: document.body
    });
}

// Refreshes page with downloads file in .Partial
function refresh(){
    $.ajax({
        url : '.Scripts/dashboard.php',
        data: {},
        type: "POST",
        context: document.body
    }).done(function (data) {
       document.getElementById('dl_container').innerHTML = data;
    });
}
