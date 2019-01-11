view = 0;

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
    if (window.location.pathname.indexOf('Movies') > -1 || window.location.pathname.indexOf('TV')){
        $('.item-container').hover(function () {
            if (view == 0 && screen.width >= 760){
                var here = $(this);
                get_meta = setTimeout(meta=get_metadata, 1500, $(this).children('.file-item').children('.fip').html(), $(this).children('.file-item').attr('id'), view);
            }
        }, function () {
            clearTimeout(get_meta);
            $(this).children('.file-item').removeClass('file-item-active');
            $(this).children('.file-item').children('.details').remove();
        });
    }

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

    //Toggle viewstyle
    $('.view-tog').on('click', function() {
        if (view == 0){
           view = 1;
           $('.span_fileitem').empty();
           $(this).addClass('view-tog-v');
           $('.item-container').addClass('item-container-art');
           $('.item-container').addClass('tooltip');
           $('.item-ren, .item-del').addClass('item-v');
           $('.item-dl img').addClass('item-dlv');
           $('.file-item').addClass('file-item-art');
           $('.file-item span').css('padding', '50px');
           $('.file-item').each(function(i, obj){
                get_metadata($(obj).children('.fip').html(), $(obj).attr('id'), view);
           });
        } else {
           view = 0;
           $(this).removeClass('view-tog-v');
           $('.file-item').removeClass('file-item-art');
           $('.item-container').removeClass('tooltip');
           $('.item-container').removeClass('item-container-art');
           $('.file-item').css('background-image', '');
           $('.file-item span').html('');
           $('.file-item span').css('padding', '0');
           $('.item-ren, .item-del').removeClass('item-v');
           $('.item-dl img').removeClass('item-dlv');
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

    //Show rename dialogue
    $('.item-ren').on('click', function(e){
        e.stopPropagation();
        $('.ren_container').addClass('ren-active');
        $(this).parent().attr('id','rename');
    });
    $('#renc').on('click', function(){
        $('.ren_container').removeClass('ren-active');
        $('#rename').removeAttr('id');
    });
    $('#renas').on('click', function(){
        rename($('#rename').children('.fip').html(), $('#rena').val());
    });

    //Show mobile breadcrumbs on tap
    $('.mobile-bc-tog').on('click', function(e){
        $(this).addClass('mbt-active');
        $('.breadcrumbs').addClass('mbc-active');
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
function get_metadata(term, id, view){

    //Attempt to get info based on title
    $.ajax({
        url: '/functions.php',
        data: {term_q: term},
        type: 'POST',
        context: document.body
    }).done(function(data){

        data_1 = JSON.parse(data);

        // If no results were found, split the title at the first number and try again
        // The title might be in standard torrent title format and shortening it may produce results
        if (Object.keys(data_1).length == 2){
            var newterm = '';
            for (var i = 0; i < term.length; i++){
               if (['1','2','3','4','5','6','7','8','9','0'].includes(term[i])){
                    break;
               } else {
                    newterm = newterm+term[i];
               }
            }
            $.ajax({
                url: '/functions.php',
                data: {term_q: newterm},
                type: 'POST',
                context: document.body
            }).done(function(data){

                data_1 = JSON.parse(data);

                // Get plot summary with new data
                plot_summary(id, view, data_1, newterm);
            });

        // The title worked fine by itself
        } else {
            plot_summary(id, view, data_1, term);
        }
    });
}

function plot_summary(id, view, data, term){
    //Plot summary isn't part of data, so use returned ID to scrape the page for the plot summary
    var imdbid = data.d[0].id;
    var img = data.d[0].i;
    var year = data.d[0].y;
    var star = data.d[0].s;
    var title = term;
    $.ajax({
        url: '/functions.php',
        data: {imdbid_q: imdbid},
        type: 'POST',
        context: document.body
    }).done(function(data){

        //Inject into page
        if (view == 0){
            expand = $('#'+id).addClass('file-item-active');
            $('#'+id).append("<div class='details'><img src='"+img+"' /><div class='desc'><h2>"+year+"</h2><h3>"+star+"</h3></div></div>");
           $('#'+id).children('.details').children('.desc').append('<p>'+data+'</p>');
        } else {
            $('#'+id).css('background-image', 'url('+img+')');
            $('#'+id).css('background-size', 'cover');
            $('#span_'+id).append('<div class="desc"><h1>'+title+'</h1><h2>'+year+'</h2><h3>'+star+'</h3><p>'+data+'</div></div>');
        }
    });
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
        },
        out: function(event, ui) {
            $('.ui-draggable-dragging .dir-box').parent().removeClass('hover-active');
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
