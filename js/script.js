//Soundcloud Initialization
function localInit() {
    SC.initialize({
        client_id: 'a0fbfae5a13e2f9785418bede98cad8d',
        redirect_uri: 'http://127.0.0.1:56563/callback.html'
    });
}

function githubInit() {
        SC.initialize({
        client_id: 'a025d7ac04682146e46fab7dec6d02bd',
        redirect_uri: 'http://musicbender.github.io/soundcloud-app/callback.html'
    });
}

localInit(); //WHICH INIT: LOCAL FOR DEV or PUBLISHED ON GITHUB?

$(document).ready(function(){
    var getUserMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia,
        audioContext = new (AudioContext || webkitAudioContext || mozAudioCntext)(),
        recorder,
        userMediaStream,
        progressBar = $('.progress-bar');
    
    //authenticate and display users information
    $('.connect').click(function(e) {
        //e.preventDefault();
        
        SC.connect().then(function() {
            console.log('AUTHENTICATION PASSED');
            return SC.get('/me');
        }).then(function(me) {
                $('.username').text(me.username);
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

    //Press buttons and using SC.Recorder
    $('.record-btn').click(function(){
        var streamSource = audioContext.createMediaStreamSource(userMediaStream);
        recorder = new SC.Recorder({context: audioContext, source: streamSource});
        recorder.start();
        setTimeout(function(){
            recorder.stop();
        }, 600000) //10 minute limit
        console.log(recorder);
    });
    //stop recording
    $('.stop-btn').click(function() {
        recorder.stop();
    });

    //Upload into soundcloud
    $('.upload-btn').click(function() {
        recorder.getWAV().then(function(wav){ //turn into Blob wav
            var upload = SC.upload({
                file: wav,
                sharing: 'public',
                title: 'Soundcloud API Test',
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
        });
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
            progressBar.text('Finished!');
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
            maxwidth: 400,
            maxheight: 200,
            show_comments: true,
            iframe: true
        }).then(function(embed){
            console.log('oEmbed response: ', embed);
            widget.html('<div class="widget">' + embed.html + '</div>');
        });
    }   
});

