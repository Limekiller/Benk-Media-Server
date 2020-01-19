// Dynamically insert video into page

var active_video;
function play(id, title, type){
    // Get the video information for the overlay
    get_metadata(decodeURIComponent(title), id, view, true);
    active_video = title;

    // Show the overlay
    $('#vid').addClass('video-container-active');
    $(".menu-container").addClass('nb-active-dl');
    $(".item-container").css('pointer-events','none');
    $('body').css('overflow-y', 'hidden');

    // Videos have to be inserted differently if it's a normal page or a search page
    if (type == 'name'){
        document.getElementById('vid').innerHTML = "<video src=\"./"+title+"\" id='_vid"+id+"' class='video-js vjs-default-skin' autoplay controls='true' preload='auto' width='100%' height='99%' data-setup='{}'><source src=\"./"+title+"\" type='video/mp4'><source src=\"./"+title+"\" type='video/webm'></video>";
    } else {
        document.getElementById('vid').innerHTML = "<video src=\""+title+"\" id='_vid"+id+"' class='video-js vjs-default-skin' autoplay controls='true' preload='auto' width='100%' height='99%' data-setup='{}'><source src=\"./"+title+"\" type='video/mp4'><source src=\"./"+title+"\" type='video/webm'></video>";
    }


    var player;
    // Only use VideoJS if not mobile
    if (screen.width >= 760){
        player = videojs('_vid'+id, {});
        $(".video-js").addClass("overlay_enabled");
        player.on('pause', function() {
            if (player.seeking()) {
                return;
            }
            $(".video-js").addClass("overlay_enabled");
            $("#vid_info_overlay").addClass("overlay_enabled");
            $("#vid_info_overlay").css('pointer-events', 'all');
            $("#vid_info_overlay").css('opacity', '1');
        });
        player.on('ended', function() {
            $(".video-js").addClass("overlay_enabled");
            $("#vid_info_overlay").addClass("overlay_enabled");
            $("#vid_info_overlay").css('pointer-events', 'all');
            $("#vid_info_overlay").css('opacity', '1');
        });
    }
    generate_overlay(player, id, title);

    $(document).keyup(function(event) {
        if(event.keyCode == 27){
            dispose_vid(player);
        }
    });

}

function dispose_vid(player) {
    player.dispose();
    $('.video-container').removeClass('video-container-active');
    $('.video-container').html("");
    $(".menu-container").removeClass('nb-active-dl');
    $(".item-container").css('pointer-events','');
    $('body').css('overflow-y', 'auto');
}

// Generates info overlay for each movie
function generate_overlay(player, id, title){

    overlay = "<div id='vid_info_overlay' class='overlay_enabled'><div class='loading'></div><img id='overlay_img' /><div id='overlay_info'><h1 id='overlay_title'></h1><h2 id='overlay_year'></h2><h3 id='overlay_stars'></h3><p id='overlay_desc'></p><h5 id='overlay_link'></h5><div style='display:flex;'><button id='overlay_play'>Play<i class='fas fa-play' style='margin-left:10px;'></i></button><button id='overlay_back'>Go Back</button><a class='item-del' href='?itemdel="+title+"'></a><a class='item-dl' href='?itemdl="+title+"'></a><div class='item-ren'></div></div></div></div>";
    $("#_vid"+id).append(overlay);

    $("#overlay_play").on('click', function() {
        $(".video-js").removeClass("overlay_enabled");
        $("#vid_info_overlay").removeClass("overlay_enabled");
        $("#vid_info_overlay").css('pointer-events', 'none');
        $("#vid_info_overlay").css('opacity', '0');
        player.play();
    });
    $("#overlay_back").on('click', function() {
        dispose_vid(player);
    });

    //Show rename dialogue
    $('.item-ren').on('click', function(e){
        $('.ren_container').addClass('ren-active');
    });

}

// Checks active download provider and then grabs results from tor.php
function get_results(method){
    document.getElementById('result_container').innerHTML = "<div class='loading'></div>";
    var input = document.getElementById('dn').value;
    var site = $('.t-choice-active').attr('id');
    $.ajax({
        url : '/.Scripts/tor.php',
        data: {site_q: site, search_q: input},
        type:"POST",
        context: document.body
    }).done(function(data) {
        document.getElementById('result_container').innerHTML = data;
        $('.result').on('click', function() {
            $(this).addClass('result_loading');
        });
    });
}

var notifNum = -1;

//Initiates download of chosen file
function grab_dl(title, method){
    if (method == 'dl'){
        var tor_site = $('.t-choice-active').attr('id');
    }
    $.ajax({
        url : '/.Scripts/tor.php',
        data: {tor_site_q: tor_site, grab_q: title, grab_l: window.location.pathname},
        type:"POST",
        context: document.body
    }).done(function(data) {
        $('body').removeClass('dnf-body');
        notifNum += 1;
        if (data == "success"){
            $('.result').removeClass('result_loading');
            $(document.body).prepend("<div class='notify njs'>Your download will start soon!</div>");
        } else if (data == "error") {
            $('.result').removeClass('result_loading');
            $(document.body).prepend("<div class='notify njs'>An error has occurred. Please try again.</div>");
        }
        $('.njs').each(function(index){
            $(this).css('margin-top', 100*index);
        });
    });
}

// Get streaming search results
function stream(){
    $('#sresult_container').html('<div class="loading"></div>');
    var query = document.getElementById('sn').value;
    $.ajax({
        url : '/.Scripts/tor.php',
        data: {s_search_q: query},
        type:"POST",
        context: document.body
    }).done(function(data) {
        $('#sresult_container').html(data);
        //$('#sresult_container').html('<iframe src='+data+'; allowfullscreen="true" style="margin-top:50px;margin-bottom:50px;width:700px;height:400px;" />');
        //window.open(data, '_blank');
    });
}

// Get link from search results
function grab_stream(link){
    $.ajax({
        url: '/.Scripts/tor.php',
        data: {link_q: link},
        type: "POST",
        context: document.body
    }).done(function(data){
        window.open(data, '_blank');
        //$('#sresult_container').html('<iframe src='+data+'; allowfullscreen="true" style="margin-top:50px;margin-bottom:50px;width:700px;height:400px;" />');
    });
}
