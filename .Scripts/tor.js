// Dynamically insert video into page
function play(id, title, type){
    $('#vid'+id).addClass('video-container-active');
    $(".menu-container").addClass('nb-active-dl');
    $(".item-container").css('pointer-events','none');
    $('body').css('overflow-y', 'hidden');

    // Videos have to be inserted differently if it's a normal page or a search page
    if (type == 'name'){
        document.getElementById('vid'+id).innerHTML = "<div id='vid"+id+"' class='vid-close'>X</div>"+
            "<video src=\"./"+title+"\" id='_vid"+id+"' class='video-js vjs-default-skin' autoplay controls='true' preload='auto' width='100%' height='99%' data-setup='{}'><source src=\"./"+title+"\" type='video/mp4'><source src=\"./"+title+"\" type='video/webm'></video>";
    } else {
        document.getElementById('vid'+id).innerHTML = "<div id='vid"+id+"' class='vid-close'>X</div>"+
            "<video src=\""+title+"\" id='_vid"+id+"' class='video-js vjs-default-skin' autoplay controls='true' preload='auto' width='100%' height='99%' data-setup='{}'><source src=\"./"+title+"\" type='video/mp4'><source src=\"./"+title+"\" type='video/webm'></video>";
    }

    // Only use VideoJS if not mobile
    if (screen.width >= 760){
        videojs('_vid'+id, {}, function(){
        });
    }

    $(document).keyup(function(event) {
        if(event.keyCode == 27){
            //if (screen.width >= 760){
            //    videojs("_vid"+id).dispose();
            //}
            $('.video-container').removeClass('video-container-active');
            $('.video-container').html("");
            $(".menu-container").removeClass('nb-active-dl');
            $(".item-container").css('pointer-events','');
            $('body').css('overflow-y', 'auto');
        }
    });

    // Close video when clicking X
    $('.vid-close').on('click', function(e){
        if (screen.width >= 760){
            videojs("_vid"+id).dispose();
        }
        $(this).parent().removeClass('video-container-active');
        $(this).parent().html("");
        $(".menu-container").removeClass('nb-active-dl');
        $(".item-container").css('pointer-events','');
        $('body').css('overflow-y', 'auto');
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
        if (data == "success"){
            $('.result').removeClass('result_loading');
            $(document.body).prepend("<div class='notify'>Your download will start soon!</div>");
        } else if (data == "error") {
            $('.result').removeClass('result_loading');
            $(document.body).prepend("<div class='notify'>An error has occurred. Please try again.</div>");
        }
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
