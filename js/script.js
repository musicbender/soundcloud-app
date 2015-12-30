//Soundcloud Initialization
function localInit() {
    SC.initialize({
        client_id: 'a0fbfae5a13e2f9785418bede98cad8d',
        redirect_uri: 'http://127.0.0.1:49392/callback.html'
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
                   navigator.mozGetUserMedia;
    var audioContext = new (AudioContext || webkitAudioContext || mozAudioCntext)();
    var recorder;
    var userMediaStream;
    console.log(SC);
    
    //authenticate and display users information
    $('.connect').click(function(e) {
        //e.preventDefault();
        
        SC.connect().then(function() {
            console.log('PASSED');
            return SC.get('/me');
        }).then(function(me) {
                console.log('DEBUG:' + me);
                $('#username').text(me.username);
                $('#first-name').text(me.first_name);
                $('#last-name').text(me.last_name);
                $('#city').text(me.city);
                $('#track-count').text(me.track_count);
                $('#sc-plan').text(me.plan);
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
        console.log(recorder);
        console.log(SC.Recorder);
        recorder.start();
        setTimeout(function(){
            recorder.stop();
            recorder.play();
        }, 5000)
    });
    $('.stop-btn').click(function() {
        recorder.stop();
    });
    $('.play-btn').click(function() {
        recorder.play();
    });
    $('.upload-btn').click(function() {
        console.log('clicked');
        recorder.getWAV().then(function(wav){
            var upload = SC.upload({
                file: wav,
                title: 'My Recording 1',
            }); //.catch(console.log("couldn't turn it into a wav blob"));
            /*upload.request.addEventListener('progress', function(e){
                console.log('progress: ', (e.loaded / e.total) * 100, '%');
            });*/
            upload.then(function(track){
                alert('Upload is done! Check your sound at ' + track.permalink_url);
            });
        });
    });
    

    
    

    
    
});

//embeds a SC player
   /*SC.oEmbed(track_url, { auto_play: false, iframe: true, maxwidth: 800, maxheight: 200 }, function(oEmbed) {
  console.log('oEmbed response: ', oEmbed);
       player.html(oEmbed.html);
   }); */