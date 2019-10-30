var progressRefresh;
var canceled_dls = [];

// Refresh results every 5 seconds
$(window).bind("load", function refresh_wait(){
    refresh();
    progressRefresh = setInterval(refresh, 5000);
});

// Cancels a downloading torrent
function cancel(gid, name){
    console.log(gid);
    // clearInterval(progressRefresh);
    // setTimeout(function() {
    //     refresh();
    //     progressRefresh = setInterval(refresh, 5000);
    // }, 10000);
    canceled_dls.push(gid);
    $('#'+gid).addClass("canceled");
    $.ajax({
        url : '.Scripts/dashboard.php',
        data: {gid_post: gid, name_post: name},
        type: "POST",
        context: document.body
    });
}

// scan.php gets the data from Aria2 and writes it to a file. This function reads that file and uses it to display the information on the downloads screen.
function refresh(){
    $.ajax({
        url : '.Scripts/dashboard.php',
        data: {},
        type: "POST",
        context: document.body
    }).done(function (data) {

        // Aria2 takes some time to actually cancel downloads, so it's not immediate after a user presses "cancel" from the UI.
        // So we do some extra things here:

        // Here we check the incoming data from Aria2 and see if an item waiting to be canceled has been canceled yet. If so, we play a quick animation
        // before actually putting the data on the page to make the UX smoother.
        canceled_dls.forEach(function(gid, index) {
            if (!data.includes(gid)) {
                $("#"+gid).addClass("canceled_anim");
            }
        });

        setTimeout(function() {
            document.getElementById('dl_container').innerHTML = data;

            // If the downloads refresh before aria2 has a chance to cancel the download, it may look like the download wasn't canceled on the UI.
            // This fixes that. We put each canceled item in an array, and when the page refreshes we check to see if the canceled items are still
            // in the data returned from Aria2. If so, we re-apply the CSS to show that they've been canceled. If not, then we clear that item
            // from the list.
            var to_remove = [];
            canceled_dls.forEach(function(gid, index) {
                if ($("#"+gid).length) {
                    $("#"+gid).addClass("canceled");
                } else {
                   to_remove.push(index);
                }
            });
            to_remove.forEach(function(index) {
                canceled_dls.splice(index, 1);
            });

        }, 500);

    });
}
