view = 1;
global_metadata = {}

$(document).ready(function(){

    // Don't use VideoJS on mobile
    // If screen size is small, cut off non-wrapping titles
    if (screen.width >= 760){
        $('head').append('<script src="http://vjs.zencdn.net/6.6.3/video.js"></script>');
    } else {
        $('.fip').each(function () {
            if ($(this).html().length > 30 && ! $(this).html().includes(' ')){
                $(this).html($(this).html().slice(0, 30));
            }
        });
    }

    //Click detection for the UI
    var bs = 0;
    var dlss = 0;

    //Dynamically calculate the distance between breadcrumbs based on title length
    var base = -220;
    var children = $('.breadcrumbs').children().length;
    for (var child = 0; child < $('.breadcrumbs').children().length - 2; child++){
        base = base - 70;
    }

    $("input[type='file']").on("change",function(){
        var files = $(this).prop("files");
        if (files.length > 1) {
            $("#file_name_label").fadeOut(400);
            $("#file_name").fadeOut(400);
            $("#file_name").val("");
        } else {
            $("#file_name_label").fadeIn(400);
            $("#file_name").fadeIn(400);
        }
    });

    $("#f_upload_s").on('click', function() {
        $(".um_cover").css("opacity", 1);
        $(".um_cover").css("pointer-events", 'none');
    });

    //Get movie data from IMDb
    var get_meta;
    var meta;

    //Mobile style changey stuff
    if ($(window).width() < 760){
        $('.breadcrumbs').css("margin-top", base);
    }
    $(window).resize(function() {
        if ($(window).width() < 760){
            $('.breadcrumbs').css("margin-top", base);
        }else {
            $('.breadcrumbs').css("margin-top", "50px");
        }});

    // Load movie info on first load
    $('.file-item').each(function(i, obj){
        get_metadata($(obj).children('.fip').html(), $(obj).attr('id'), view, false);
    });
    //Toggle viewstyle
    $('.view-tog').on('click', function() {
        if (view == 0){
            $('.file-container').addClass('file-container-transition');
            $(this).addClass('view-tog-v');
            setTimeout(function() {
                view = 1;
                $('.span_fileitem').empty();
                $('.item-container').addClass('item-container-art');
                $('.item-container').addClass('tooltip');
                $('.item-ren, .item-del').addClass('item-v');
                $('.item-dl img').addClass('item-dlv');
                $('.file-item').addClass('file-item-art');
                $('.file-item .loading').css('display','inherit');
                $('.file-item span').css('padding', '50px');
                $('.file-item').each(function(i, obj){
                    get_metadata($(obj).children('.fip').html(), $(obj).attr('id'), view, false);
                });
            }, 100);
            setTimeout(function(){
                $('.file-container').removeClass('file-container-transition');
            }, 500);
        } else {
            $('.file-container').addClass('file-container-transition');
            $(this).removeClass('view-tog-v');
            setTimeout(function() {
                view = 0;
                $('.file-item').removeClass('file-item-art');
                $('.item-container').removeClass('tooltip');
                $('.item-container').removeClass('item-container-art');
                $('.file-item').css('background-image', '');
                $('.file-item').css('opacity', '1');
                $('.file-item .loading').css('display','none');
                $('.file-item span').html('');
                $('.file-item span').css('padding', '0');
                $('.fip').removeAttr('style');
                $('.item-ren, .item-del').removeClass('item-v');
                $('.item-dl img').removeClass('item-dlv');
            }, 100);
            setTimeout(function(){
                $('.file-container').removeClass('file-container-transition');
            }, 500);
        }
    });

    //Tooltip hover
    window.onmousemove = function (e) {
        if (screen.width >= 760){
            var x = e.clientX;
            y = e.clientY;
            $('.span_fileitem').css('top', y+15+'px');
            if (x + 800 > $(window).width()){
                if (x - 800 < 0){
                    $('.span_fileitem').css('left', x-400+'px');
                } else {
                    $('.span_fileitem').css('left', x-750+'px');
                }
            } else {
                $('.span_fileitem').css('left', x+15+'px');
            }
        } else {
            $('.span_fileitem').css('display', 'none');
        }
    }

    //Move to alphabetical category on keystroke
    $('body').keyup(function(event) {
        var key = String.fromCharCode(event.keyCode).toLowerCase();
        document.getElementById(key).scrollIntoView();
    });

    //Show clickable alphabet list when clicking a letter
    $('.letter-head').on('click',function(){
        var letter = 65;
        var str ="<div class='letter-chooser'>";
        while (letter < 91){
            str +="<span class='letter'>"+String.fromCharCode(letter).toUpperCase()+"</span>";
            letter++;
        }
        var self = this;
        $(this).fadeOut(400);
        setTimeout(function(){
            $(self).html(str);
            $('.letter').on('click',function(){
                $(this).parent().parent().addClass('letter-chooser-active');
                var key = $(this).html().toLowerCase();
                document.getElementById(key).scrollIntoView();
            });
        }, 400);
        $(this).fadeIn(400);
        setTimeout(function(){
            if ($(self).hasClass('letter-chooser-active')){
                $(self).html($(self).attr('id').toUpperCase());
                $(self).removeClass('letter-chooser-active');
            }
        }, 400);
    });

    //Show search bar
    $('.search-button').on('click',function(e){
        if ($('.search-form').hasClass('search-form-active')){
            $(this).removeClass('search-button-m-active');
            $('.search-form').removeClass('search-form-active');
        } else {
            $('.search-form').addClass('search-form-active');
            $(this).addClass('search-button-m-active');
        }
    });

    // Handle rename dialog stuff
    $('#renc').on('click', function(){
        $('.ren_container').removeClass('ren-active');
    });
    $('#renas').on('click', function(){
        rename(active_video, $('#rena').val());
    });

    //Let enter work for searching on torrent search and rename dialogue
    $("#dn").keyup(function(event) {
        if(event.keyCode == 13){
            $("#dnb").click();
        }
    });
    $("#rena").keyup(function(event) {
        if(event.keyCode == 13){
            $("#renas").click();
        }
    });

    //Don't let movie appear when deleting or downloading file
    $('.item-del').on('click', function(e){
        e.stopPropagation();
    });
    $('.item-dl').on('click', function(e){
        e.stopPropagation();
    });

    //Toggle alphabetical categories
    $('.letter-head-tog').on('click',function(){
        if ($('.letter-head').hasClass('letter-head-active')){
            $('.letter-head').removeClass('letter-head-active');
        } else {
            $('.letter-head').addClass('letter-head-active');}
    });


    //Show mobile breadcrumbs on tap
    $('.mobile-bc-tog').on('click', function(e){
        $(this).addClass('mbt-active');
        $('.breadcrumbs').addClass('mbc-active');
    });

    // Play video
    $('.file-item').on('click', function() {
        play($(this).attr('id'), $(this).attr('filename'), $(this).attr('type'), $(this).attr('term'));
    });

    //Close video
    $('.vid-close-active').on('click', function(e){
        $(this).parent().removeClass('video-container-active');
        $(this).parent().html("");
    });

    //Fancy hover stuff with + button
    $('#sm-hover').hover(function() {
        $('.new-button').hover(function() {
            $('.dl-button,.st-button').removeClass('sm-buttons-in');
        }, function() {
        });
    }, function () {
        $('.dl-button,.st-button').addClass('sm-buttons-in');
    });
    $('.new-button').on('click', function(){
        if (screen.width <= 760){
            if (bs == 0){
                $('.dl-button,.st-button').removeClass('sm-buttons-in');
                bs = 1;
            } else if (bs == 1){
                $('.dl-button,.st-button').addClass('sm-buttons-in');
                $('.new-menu').addClass('nm-active');
                $('.dl-button').addClass('nb-active-dl');
                $('.st-button').addClass('nb-active-dl');
                $(this).addClass('nb-active');
                bs = 2;
            } else {
                $('.dl-button').removeClass('nb-active-dl');
                $('.new-menu').removeClass('nm-active');
                $('.st-button').removeClass('nb-active-dl');
                $(this).removeClass('nb-active');
                bs = 0;
            }
        } else {
            if (bs == 0) {
                $('.new-menu').addClass('nm-active');
                $('.dl-button').addClass('nb-active-dl');
                $('.st-button').addClass('nb-active-dl');
                $(this).addClass('nb-active');
                bs = 1;
            } else {
                $('.dl-button').removeClass('nb-active-dl');
                $('.new-menu').removeClass('nm-active');
                $('.st-button').removeClass('nb-active-dl');
                $(this).removeClass('nb-active');
                bs = 0;
            }
        }
    });

    //Show different dialogues (create new directory, upload media, download new file, stream)
    $('#cnd').on('click', function(e) {
        $('.new-menu').removeClass('nm-active');
        $('.new-button').removeClass('nb-active');
        $('.cnd_container').addClass('cnd-active');
    });
    $('#um').on('click', function(e) {
        $('.new-menu').removeClass('nm-active');
        $('.new-button').removeClass('nb-active');
        $('.um_container').addClass('um-active');
    });
    $('#dnf').on('click', function(e) {
        $('.new-menu').removeClass('nm-active');
        $('.new-button').removeClass('nb-active');
        $('.dnf_container').addClass('dnf-active');
        $('body').addClass('dnf-body');
    });
    $('.st-button').on('click', function(e) {
        $('.new-menu').removeClass('nm-active');
        $('.new-button').removeClass('nb-active');
        $('.snf_container').addClass('snf-active');
        $('body').addClass('snf-body');
    });

    //Show deletion dialogue
    $(".box-del").on('click', function(){
        $(".dd_container").addClass('dd-active');
        $("#dd_submit").html("<a href='"+$(this).attr('id')+"'><button>Yes</button></a>");
    });

    //Close dialogues
    $("#ddc").on('click', function(){
        $(".dd_container").removeClass('dd-active');
    });
    $('#cndc').on('click', function(e) {
        $('.cnd_container').removeClass('cnd-active');
    });
    $('#umc').on('click', function(e) {
        $('.um_container').removeClass('um-active');
    });
    $('#dnfc').on('click', function(e) {
        $('body').removeClass('dnf-body');
        $('.dnf_container').removeClass('dnf-active');
    });
    $('#snfc').on('click', function(e) {
        $('body').removeClass('snf-body');
        $('.snf_container').removeClass('snf-active');
    });
    $('#tc1').on('click', function(){
        $(this).addClass('t-choice-active');
        $('#tc2').removeClass('t-choice-active');
    });
    $('#errc').on('click', function(){
        $('.error_container').removeClass('error-active');
    });

    //Switch torrent source
    $('#tc2').on('click', function(){
        $(this).addClass('t-choice-active');
        $('#tc1').removeClass('t-choice-active');
    });

    //Items that are toggled when clicking the button, and deactivated when clicking anywhere else
    $('.search-button').on('click', function(e) {
        e.stopPropagation();
    });
    $('.search-form').on('click', function(e) {
        e.stopPropagation();
    });
    $('.menu-container').on('click', function(e) {
        e.stopPropagation();
    });
    $('.mobile-bc-tog').on('click', function(e) {
        e.stopPropagation();
    });
    $('.breadcrumbs').on('click', function(e) {
        e.stopPropagation();
    });

    $(document).on('click', function(e){
        $('.search-form').removeClass('search-form-active');
        $('.search-button').removeClass('search-button-m-active');
        $('.dl-button').removeClass('nb-active-dl');
        $('.st-button').removeClass('nb-active-dl');
        $('.new-menu').removeClass('nm-active');
        $('.new-button').removeClass('nb-active');
        $('.mobile-bc-tog').removeClass('mbt-active');
        $('.breadcrumbs').removeClass('mbc-active');
        bs = 0;
    });
});

// Get movie info from IMDb database
function get_metadata(term, id, view, overlay){

    term = decodeURIComponent(term);
    var timeout = setTimeout(noIMDB(id));

    //Attempt to get info based on title
    $.ajax({
        url: '/functions.php',
        data: {term_q: term},
        type: 'POST',
        context: document.body,
    }).done(function(data){

        try {
            data = JSON.parse(data);
            data_1 = JSON.parse(data[0]);
            plot_summary(id, data_1, term, null, data[1], timeout, overlay);

        } catch (e) {

            // If no results were found, split the title at the first number or paren and try again
            // The title might be in standard torrent title format and shortening it may produce results
            var newterm = '';
            for (var i = 0; i < term.length; i++){
                if (['1','2','3','4','5','6','7','8','9','0','(',')'].includes(term[i])){
                    break;
                } else {
                    newterm = newterm+term[i];
                }
            }

            $.ajax({
                url: '/functions.php',
                data: {term_q: newterm, term_old: term},
                type: 'POST',
                context: document.body
            }).done(function(data){

                data = JSON.parse(data);
                data_1 = JSON.parse(data[0]);

                // Get plot summary with new data
                plot_summary(id, data_1, newterm, term, data[1], timeout, overlay);
            });
        }

    });
}

function plot_summary(id, data, term, oldterm, image_exists, timeout, overlay){
    //Plot summary isn't part of data, so use returned ID to scrape the page for the plot summary
    var imdbid = data['id'];
    var year = data['y'];
    var star = data['s'];
    var realtitle = data['l'];
    if (oldterm) {
        var title = oldterm;
    } else {
        var title = term;
    }

    if (image_exists) {
        $('#'+id).attr('term', realtitle);

        var img = '/.Images/cache/'+title+'.jpg';
        $('#'+id).css('background-image', 'url("'+img+'")');
        $('#'+id).css('background-size', 'cover');
        $('#'+id+' .loading').css('display', 'none');

        global_metadata[realtitle] = {};
        global_metadata[realtitle]['img'] = img;
        global_metadata[realtitle]['title'] = realtitle;
        global_metadata[realtitle]['year'] = year;
        global_metadata[realtitle]['stars'] = star;
        clearTimeout(timeout);
    } else {
        var img = data['i'];
    }

    $.ajax({
        url: '/functions.php',
        data: {imdbid_q: imdbid},
        type: 'POST',
        context: document.body
    }).done(function(data){

        //Inject into page
        $('.fip').removeAttr('style');
        $('#'+id).css('opacity', '1');
        $('#'+id+' .loading').css('display', 'none');
        if (image_exists) {
            global_metadata[realtitle]['desc'] = data;
        } else {
            $('#'+id).attr('term', realtitle);
            $('#'+id).css('background-image', 'url("'+img+'")');
            $('#'+id).css('background-size', 'cover');

            global_metadata[realtitle] = {};
            global_metadata[realtitle]['img'] = img;
            global_metadata[realtitle]['title'] = realtitle;
            global_metadata[realtitle]['year'] = year;
            global_metadata[realtitle]['year'] = year;
            global_metadata[realtitle]['desc'] = data;
        }

        if (overlay) {
            $("#vid_info_overlay .loading").remove();
            $("#overlay_img").attr("src", img);
            $("#overlay_title").html(realtitle);
            $("#overlay_year").html(year);
            $("#overlay_stars").html(star);
            $("#overlay_desc").html(data);
        }

    });
}

function noIMDB(id) {
    setTimeout(function() {
        if ($('#'+id+' .loading').css('display') != 'none') {
            $('#'+id+' .loading').css('display', 'none');
            $('#'+id+' .loading').siblings('.fip').css('color', 'black');
            $('#'+id+' .loading').siblings('.fip').css('font-size', '25px');
            $('#'+id+' .loading').siblings('.fip').css('white-space', 'normal');
            $('#'+id+' .loading').siblings('.fip').css('width', '180px');
            $('#'+id).css('opacity', '0.5');
        }
    }, 10000);
}

function rename(file, name) {
    file_prefix = window.location.pathname;
    $.ajax({
        url: '/functions.php',
        data: {file_prefix_q: file_prefix, file_q: file, name_q: name},
        type:"POST",
        context: document.body
    }).done(function() {
        location.reload();
    });
}

// Allow directories and files to be dragged and dropped into new locations
$(function() {
    $(".box-container").draggable({
        start: function(event, ui){
            $('.box-del').css("opacity","0");
        },
        stop: function(event, ui){
            $('.box-del').css("opacity","");
        },
        revert:"invalid",
        distance: 20,
        cursor:"move",cursorAt:{top:100,left:100}
    });

    $(".item-container").draggable({
        start: function(event, ui){
            var size= 75;
            for (var chr of $(this).children('.file-item').children('.fip').html()){
                size += 15;
            }
            $('.item-del').css("opacity","0");
            if (view == 0) {
                $(this).css('width', size+'px');
            }
            $(".item-container").css('pointer-events','none');
        },
        stop: function(event, ui){
            $('.item-del').css("opacity","");
            $(this).css('width','');
            $(".item-container").css('pointer-events','all');
        },
        zIndex: 100,
        revert:"invalid",
        distance: 20,
        cursor:"move",cursorAt:{top:60,left:50}
    });

    $(".breadcrumb,.box-container").droppable({
        over: function(event, ui) {
            $('.ui-draggable-dragging .dir-box').parent().addClass('hover-active');
            $('.ui-draggable-dragging.item-container').addClass('hover-active');
        },
        out: function(event, ui) {
            $('.ui-draggable-dragging .dir-box').parent().removeClass('hover-active');
            $('.ui-draggable-dragging.item-container').removeClass('hover-active');
        },
        tolerance: 'pointer',

        drop: function(event, ui){
            var path = window.location.pathname;
            if ($(this).hasClass("breadcrumb")){
                var loc = "/"+$(this).parent().attr("href").split("/")[1];
            } else {var loc = path+$(this).children("a").attr("href").split("/")[1];}

            if ($(ui.draggable[0]).hasClass('item-container')){
                if (loc == '/'){
                    location.reload();
                    return;
                }
                var orig = path+encodeURIComponent(encodeURIComponent($(ui.draggable[0]).children(".file-item").children(".fip").html()))+'.mp4';
            } else {
                var orig = path+$(ui.draggable[0]).children("a").attr("href").split("/")[1];
            }

            $.ajax({
                url:'/functions.php',
                data: {dest: loc, source: orig},
                type:"POST",
                context:document.body
            }).done(function() {
                location.reload();
            });
        }
    });
});

// MERGED TOR.JS WITH ADD.JS FROM THIS POINT ON


// Dynamically insert video into page

var active_video;
function play(id, title, type, term){


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
        player.on('error', function() {
            $(".error_container").addClass("error-active");
        });
    }

    // Get the video information for the overlay
    if (typeof term === "undefined") {
        modified_title = decodeURIComponent(title);
        modified_title = modified_title.split(".");
        modified_title.pop();
        get_metadata(modified_title.join("."), id, view, true);
    }

    active_video = title;
    generate_overlay(player, id, title);

    if (typeof term !== "undefined") {
        $("#vid_info_overlay .loading").remove();
        $("#overlay_img").attr("src", global_metadata[term]['img']);
        $("#overlay_title").html(global_metadata[term]['title']);
        $("#overlay_year").html(global_metadata[term]['year']);
        $("#overlay_stars").html(global_metadata[term]['stars']);
        $("#overlay_desc").html(global_metadata[term]['desc']);
    }

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

    overlay = "<div id='vid_info_overlay' class='overlay_enabled'><img id='overlay_img'><div class='loading'></div></img><div id='overlay_info'><h1 id='overlay_title'>"+title+"</h1><h2 id='overlay_year'></h2><h3 id='overlay_stars'></h3><p id='overlay_desc'></p><h5 id='overlay_link'>Media information is taken from the filename:<br />"+decodeURIComponent(decodeURIComponent(title))+"<br />If this information is not correct, you can try using the rename file function and typing in the exact title of the movie or TV show.</h5><div style='display:flex;'><button id='overlay_play'>Play<i class='fas fa-play' style='margin-left:10px;'></i></button><button id='overlay_back'>Go Back</button><a class='item-del' href='?itemdel="+title+"'></a><a class='item-dl' href='?itemdl="+title+"'></a><div class='item-ren'></div></div></div></div>";
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
