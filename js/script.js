//Soundcloud Initialization
function localInit() {
    SC.initialize({
        client_id: 'a0fbfae5a13e2f9785418bede98cad8d',
        redirect_uri: 'http://127.0.0.1:49792/callback.html'
    });
}

function githubInit() {
        SC.initialize({
        client_id: 'a025d7ac04682146e46fab7dec6d02bd',
        redirect_uri: 'http://musicbender.github.io/soundcloud-app/callback.html'
    });
}

githubInit(); //WHICH INIT: LOCAL FOR DEV or PUBLISHED ON GITHUB?

$(document).ready(function(){
    var getUserMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia,
        audioContext = new (AudioContext || webkitAudioContext || mozAudioCntext)(),
        recorder,
        userMediaStream,
        progressBar = $('.progress-bar');
    
    //Authenticate and display users information
    $('.connect').click(function(e) {
        //e.preventDefault();
        
        SC.connect().then(function() {
            console.log('AUTHENTICATION PASSED');
            return SC.get('/me');
        }).then(function(me) {
            $('.username').text(me.username);
            $('.sign-in').hide();
            $('.greeting').show();
            $('.controls').show();
            $('.record-btn-4').css('background-color', '#EB6772');
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
    $('.record-section').on('click', '.record-btn-4', function() {
        var streamSource = audioContext.createMediaStreamSource(userMediaStream);
        recorder = new SC.Recorder({context: audioContext, source: streamSource});
        recorder.start();
        $(this).removeClass('record-btn-4').addClass('stop-btn');
        setTimeout(function(){
            recorder.stop();
        }, 600000) //10 minute limit
        $('.record-section').off('click', '.record-btn-4');
    });
    
    //Stop Recording
    $('.record-section').on('click', '.stop-btn', function() {
        recorder.stop();
        $('.stop-btn').hide();
        $('.upload-btn').show();
        $('.play-btn').show();
        $('.delete-btn').show();
    });
    
    //play recording
    $('.play-btn').on('click', function(){
            recorder.play();
    });

    //Upload into soundcloud and embed track
    $('.record-section').on('click', '.upload-btn', function() {
        $('.upload-btn').hide();
        $('.spinner').show();
        var userTitle = $('.track-name').val();
        recorder.getWAV().then(function(wav){ //turn into Blob wav
            var upload = SC.upload({
                file: wav,
                sharing: 'public',
                title: userTitle
            });
            $('.progress-bar').text('Uploading...'); 
            upload.then(function(track){ //upload
                $('.track').append('<a href="' + track.permalink_url + '">' + track.title + '</a>')
                alert('Upload is done! Check your sound at ' + track.permalink_url);
                setTimeout(function(){ 
                    checkState(track, function(t){
                        useState(track, t);
                    });  //first argument of setTimeout needs to be a an anonymous function. I warpped
                }, 2000);             //the checkState() in it and the timeout worked
            });
            upload.request.addEventListener('progress', function(event){ //show progress
                var progressPercent = (event.loaded / event.total) * 100;
                console.log('Progress: ', progressPercent + '%' + 'loaded: ' + event.loaded);
                progressBar.text('Progress: ' + progressPercent + '%');;
            });
        }).catch(function(){
            console.log('Upload Failed :(');
            $('.spinner').hide();
            $('.failed').show();
        });
    });

    //Hover events
    $('.record-btn-4, .stop-btn').mouseenter(function(){
        $(this).css('background-color', 'red');
        $(this).css('cursor', 'pointer');
    });
    $('.record-btn-4, .stop-btn').mouseleave(function(){
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
            progressBar.text('Processing track...');
            setTimeout(function(){
               checkState(track, function(t){
                   useState(track, t);
               });
           }, 2000);
        }
        else if (t.state == "finished"){
            $('.spinner').hide();
            $('.complete').show();
            embed(track);
            
        }
        else {
            progressBar.text('Failed to embed your track. Please visit your link to see it on Soundcloud');
        }  
    }
    
    function embed(track) {
        var widget = $('.widget-section');
        SC.oEmbed(track.permalink_url, {
            auto_play: true,
            maxwidth: 500,
            maxheight: 225,
            show_comments: true,
            iframe: true
        }).then(function(embed){
            console.log('oEmbed response: ', embed);
            widget.html('<div class="widget">' + embed.html + '</div>');
        });
    }   
});

