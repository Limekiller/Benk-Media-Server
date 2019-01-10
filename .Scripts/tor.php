<?php

//Gets search results from one of two download providers by scraping their webpages
function get_results($site, $query){
    libxml_use_internal_errors(true);

    if ($site == 'tc1'){
        $html = file_get_contents('https://pirateproxy.gdn/search/'.rawurlencode($query).'/0/99/0');
    } else if ($site == 'tc2'){
        $query = str_replace(" ", "-", $query);
        $html = file_get_contents('https://www.magnetdl.com/'.substr($query,0,1).'/'.rawurlencode($query).'/se/desc/');
    }
    if ($site == 'tc1' || $site == 'tc2'){
        $method = 'dl';
    }

    $doc = new DOMDocument();
    if(!empty($html)){
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);

        if ($site == 'tc1'){
            $links = $xpath->query('//a[@class="detLink"]');
        }else if ($site == 'tc2'){
            $links = $xpath->query('//td[@class="n"]/a/@title');
        }

        if($links->length > 0){
            $inject = "";
            foreach ($links as $link){
                $link = $link->textContent;

                if ($method != 'stream'){
                    $inject = $inject.'<div onclick="grab_dl(this.innerHTML, \''.$method.'\')" class="result">'.$link.'</div>'; 
                } else {
                    $inject = $inject.'<div onclick="grab_dl(\''.$link.'\', \''.$method.'\')" class="result">'.$link.'</div>'; 
                }
            }
        } else { echo 'No results found!'; }
        echo $inject;
    } 
}

//Initiates download from one of two providers by scraping their HTML
function grab_dl($tor_site, $title, $site){
    libxml_use_internal_errors(true);
    $home = '/home/www-data';

    if ($tor_site == 'tc1'){
        $html = file_get_contents('https://pirateproxy.gdn/search/'.rawurlencode($title).'/0/99/0');
    } else if ($tor_site == 'tc2'){
        $title = strtolower(str_replace([' ','.',':','(',')','[',']',';'], '-', $title));
        $html = file_get_contents('https://www.magnetdl.com/'.substr($title,0,1).'/'.rawurlencode($title).'/se/desc/');
    }

    $doc = new DOMDocument();
    if(!empty($html)){
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);

        if ($tor_site == 'tc1'){
            $links = $xpath->query('//a[@title="Download this torrent using magnet"]/@href');
        } else if ($tor_site == 'tc2'){
            $links = $xpath->query('//td[@class="m"]/a/@href');
        }

        if($links->length > 0){
            $choice = $links[0]->nodeValue;
        } else { echo "error"; return;}

        if ($tor_site == 'tc2' || $tor_site == 'tc1'){
            //Set up directory so scan.php can read it correctly
            $title = rawurlencode($title);
            mkdir("../.Partial/$title");
            exec("echo '$choice\n".rawurldecode($site)."' >> '../.Partial/$title.start'");
            echo "success";
        } 
    } 
}

// Scrape search.stream.cr for their results
function stream($search_term){
    libxml_use_internal_errors(true);
    $search_term = str_replace(" ", "+", $search_term);
    $html = file_get_contents('https://scrasdfcr/search.php?query='.$search_term); 
    $doc = new DOMDocument();

    if(!empty($html)){
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        $links = $xpath->query('//a[@class="ml-mask"]/@href');
        $titles = $xpath->query('//a[@class="ml-mask"]/@oldtitle');
        $results = '';

    } else {
        // HDGO.to is broken trash.
        //$html = file_get_contents('http://www1.hdgo.to/search-movies/'.$search_term.'.html'); 
        //error_log('http://www1.hdgo.to/search-movies/'.$search_term.'.html');
        //$doc = new DOMDocument();

        //if(!empty($html)){
        //    $doc->loadHTML($html);
        //    $xpath = new DOMXPath($doc);
        //    $titles = $xpath->query('//div[@class="title"]');
        //    $links = $xpath->query('//div[@class="title"]/a/@href');
        //    $results = '';

        //    for ($i = 0; $i < $links->length; $i++){
        //        $link = $links->item($i)->value;
        //        $title = substr($titles->item($i)->textContent, 0, -5);
        //        $results = $results.'<div onclick="grab_stream(\''.$link.'\')" class="result">'.$title.'</div>'; 
        //    }
        //}
        $html = file_get_contents('https://hdm.to/search/'.$search_term);
        $doc = new DOMDocument();

        if(!empty($html)){
            $doc->loadHTML($html);
            $xpath = new DOMXPath($doc);
            $titles = $xpath->query('//div[@class="movie-details"]');
            $links = $xpath->query('//article/a/@href');
            $results = '';
        } 
    }

    for ($i = 0; $i < $links->length; $i++){
        $link = $links->item($i)->value;
        $title = substr($titles->item($i)->textContent, 0, -5);
        $title = $titles->item($i)->textContent;
        $results = $results.'<div onclick="grab_stream(\''.$link.'\')" class="result">'.$title.'</div>'; 
    }
    echo $results;
}

// Grab video page from search
function grab_stream($link){
    libxml_use_internal_errors(true);
    $html = file_get_contents($link); 
    $doc = new DOMDocument();

    if(!empty($html)){
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        if (strpos($link, 'hdm.to') !== false){
           $links = $xpath->query('//iframe/@src'); 
        } else if (strpos($link, '123hulu.com') !== false){
            $links = $xpath->query('//div[@id="media-player"]/script');
            $base64 = substr($links[0]->textContent, 0, 29);
            $base64 = substr($base64, 0, strlen($base64)-2);
        } else {
            
            $eid = $xpath->query('//a[@id="sv-ca1"]/@data-eid');
            $eid = $eid[0]->textContent;

            $full_url = 'https://scr.cr/gd-source.php?eid='.$eid;
            $json = file_get_contents($full_url);


            //$links = $xpath->query('//video[@class="jw-video"]/@src');
        }
        echo $links[0]->textContent;
    }
}

// Old code to grab streams from a different and worse site.
// I have no idea how long search.stream.cr will exist so let's keep this here
# $html = file_get_contents('https://solarmoviesc.co/'.$search_term.'/?action=watching');
# $doc = new DOMDocument();
# if(!empty($html)){
#     $doc->loadHTML($html);
#     $xpath = new DOMXPath($doc);
#     $link = $xpath->query('//iframe/@src');
#     if($link->length > 0){
#         echo $link[0]->nodeValue;
#     } else { echo "error"; return;}
# }

//Allow these functions to be called from tor.js
if (isset($_POST['search_q'])){
    echo get_results($_POST['site_q'], $_POST['search_q']);
}
if (isset($_POST['grab_q'])){
    echo grab_dl($_POST['tor_site_q'], $_POST['grab_q'], $_POST['grab_l']);
}
if (isset($_POST['s_search_q'])){
    echo stream($_POST['s_search_q']);
}
if (isset($_POST['link_q'])){
    echo grab_stream($_POST['link_q']);
}
?>
