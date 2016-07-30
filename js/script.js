//Soundcloud Initialization
function localInit() {
    SC.initialize({
        client_id: 'a0fbfae5a13e2f9785418bede98cad8d',
        redirect_uri: 'http://127.0.0.1:57283/callback.html'
    });
}

function publishInit() {
        SC.initialize({
        client_id: 'a025d7ac04682146e46fab7dec6d02bd',
        redirect_uri: 'https://soundcloud-recorder.patjacobs.io/callback.html'
    });
}

//localInit(); //WHICH INIT: LOCAL FOR DEV or PUBLISHED ON GITHUB?
publishInit();

$(document).ready(function(){
    var getUserMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia,
        audioContext = new (AudioContext || webkitAudioContext || mozAudioCntext)(),
        recorder,
        userMediaStream;
    
    //Authenticate and display users information
    $('.connect').click(function() {
        SC.connect().then(function() {
            return SC.get('/me');
        }).then(function(me) {
            $('.username').text(me.username);
            $('.sign-in').hide();
            $('.greeting').show();
            $('.controls').show();
            $('.record-btn-main').addClass('record-btn-active');
        }).catch(function(error) {
            console.log(error);
        });
    }); 
    
    //Set up getUserMedia
    getUserMedia.call(navigator, {video: false, audio: true}, function(stream){
        userMediaStream = stream;
    }, function(error){
      alert('There was a problem in getting the video and audio stream from your device. Did you block the access?');
    });
    
//BUTTON EVENTS
    //Press buttons and using SC.Recorder
    $('.record-section').on('click', '.record-btn-active', function() {
        var streamSource = audioContext.createMediaStreamSource(userMediaStream);
        recorder = new SC.Recorder({context: audioContext, source: streamSource});
        recorder.start();
        $(this).removeClass('record-btn-main').addClass('stop-btn');
        setTimeout(function(){
            recorder.stop();
        }, 600000) //10 minute limit
        $('.info').text('Recording!');
        $('.control-form').hide();
        $('.record-section').off('click', '.record-btn-active');
    });
    
    //Stop Recording
    $('.record-section').on('click', '.stop-btn', function() {
        recorder.stop();
        $('.stop-btn').hide();
        $('.upload-btn').show();
//        $('.play-btn').show();
//        $('.delete-btn').show();
        $('.info').text('Recording finished. Now, press the upload button to upload it directly to your Soundcloud account!');
    });
    
    //play recording
//    $('.play-btn').on('click', function(){
//            recorder.play();
//    });

    //Upload into soundcloud and embed track
    $('.record-section').on('click', '.upload-btn', function() {
        $('.info').text('Uploading to Soundcloud...');
        $('.upload-btn').hide();
        $('.spinner').show();
        var userTitle = getUserTitle();
        recorder.getWAV().then(function(wav){ //turn into Blob wav
            var upload = SC.upload({
                file: wav,
                sharing: 'public',
                title: userTitle
            });
            
            upload.then(function(track){ //upload
                $('.track').append('<a href="' + track.permalink_url + '">' + track.title + '</a>')
                $('.info').text('Upload complete. Processing track...');
                setTimeout(function(){
                    $('.soundcloud-is-slow').show();
                }, 1000);
                setTimeout(function(){ 
                    checkState(track, function(t){
                        useState(track, t);
                    });  //first argument of setTimeout needs to be a an anonymous function. I warpped
                }, 2000);             //the checkState() in it and the timeout worked
            });
            upload.request.addEventListener('progress', function(event){ //show progress
                var progressPercent = (event.loaded / event.total) * 100;
                console.log('Progress: ', progressPercent + '%' + 'loaded: ' + event.loaded);
            });
        }).catch(function(){
            console.log('Upload Failed :(');
            $('.spinner').hide();
            $('.failed').show();
        });
    });

    //Hover events
    $('.record-section').on('mouseenter', '.record-btn-active, .stop-btn', function(){
        $(this).css('background-color', 'red');
        $(this).css('cursor', 'pointer');
    });
        
    $('.record-section').on('mouseleave', '.record-btn-active, .stop-btn', function(){
        $(this).css('background-color', '#EB6772');
        $(this).css('cursor', 'default');
    });
    $('.upload-btn').mouseenter(function(){
        $(this).css('color', 'red');
        $(this).css('cursor', 'pointer');
    });
    $('.upload-btn').mouseleave(function(){
        $(this).css('color', '#EB6772');
        $(this).css('cursor', 'default');
    });
    $('.play-btn, .delete-btn').mouseenter(function(){
        $(this).css('cursor', 'pointer');
    });
    $('.play-btn, .delete-btn').mouseleave(function(){
        $(this).css('cursor', 'default');
    });
    
    function checkState(track, callback) {
        var trackID = 'tracks/' + track.id;
        SC.get(trackID).then(function(t){
            callback(t);
        });
    }
    
    function useState(track, t) {
        if (t.state == "processing"){
            console.log("processing");
            //progressBar.text('Processing track...');
            setTimeout(function(){
               checkState(track, function(t){
                   useState(track, t);
               });
           }, 2000);
        } else if (t.state == "finished"){
            $('info').text('Processing finished. Embedding track...');
            $('.spinner').hide();
            $('.complete').show();
            embed(track);
            
        } else {
            //progressBar.text('Failed to embed your track. Please visit your link to see it on Soundcloud');
        }  
    }
    
    function embed(track) {
        var widget = $('.widget-section');
        SC.oEmbed(track.permalink_url, {
            auto_play: true,
            maxwidth: 500,
            maxheight: 175,
            show_comments: true,
            iframe: true
        }).then(function(embed){
            console.log('oEmbed response: ', embed);
            widget.html('<div class="widget">' + embed.html + '</div>');
            $('.info').text('Track embededed..ed. Check it out below!');
            $('.soundcloud-is-slow').hide();
        });
    }  
    
    function getUserTitle() {
        var title = $('.track-name').val();
        if (title.length == 0) {
            return "My Recording";
        } else {
            return title; 
        }
    }
});



