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
        }, 1000)
    });
    //stop recording
    $('.stop-btn').click(function() {
        recorder.stop();
    });
    //playback recording
    $('.play-btn').click(function() {
        recorder.play();
    });
    //Upload into soundcloud
    $('.upload-btn').click(function() {
        console.log('upload clicked');
        var thisTrack;
        
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
                    displayTrack(track); //first argument of setTimeout needs to be a an anonymous function. I warpped
                }, 2000);             //the checkState() in it and the timeout worked
            });
            upload.request.addEventListener('progress', function(event){ //show progress
                var progressPercent = (event.loaded / event.total) * 100;
                console.log('Progress: ', progressPercent + '%' + 'loaded: ' + event.loaded);
                $('.progress-bar').text('Progress: ' + progressPercent + '%');;
            });
        }).catch(function(){
            console.log('Upload Failed :(');
        });
    });
    
    function displayTrack(track) {
        var finished = checkState(track);
        if (finished){
            embed(track);
        }
        else if (!finished){
            console.log('not finished');
        }
        else {
            console.log('I dunno');
        }
    }
    
    function checkState(track) {
        var trackID = 'tracks/' + track.id;
        SC.get(trackID).then(function(t){  //permalink_url & uri is 406. id & permalink is 404
                if (t.state == "processing"){
                   setTimeout(function(){
                       checkState(track);
                   }, 2000);
                    console.log("poop");
                    }
                else if (t.state == "finished"){
                    alert('It worked! Embed away!');
                    return true;
                }
                else {
                    console.log('state is at "failed"');
                    return false;
                }  
            }).catch(function(){
                alert('nope');
        });
    }

    function embed(track) {
        SC.oEmbed(track.permalink_url, {
            auto_play: true,
            iframe: true,
            element: elementLoc
        }).then(function(embed){
          console.log('oEmbed response: ', embed);
            elementLoc.html(oEmbed.html);
        });
    }
    
//    function embedTrack(track) {
//        var elementLoc = $('.track');
//        var trackState = track.state;
//        var testState;
//        do {
//            SC.get(track.id).then(function(t){
//                testState = t.state;
//            }).catch(function(){
//                alert('nope')
//            });
//                trackState = testState;
//        }
//        while (trackState == "processing");
//        
//        if (trackState == "finished"){
//            SC.oEmbed(track.permalink_url, {
//                auto_play: true,
//                iframe: true,
//                element: elementLoc
//            }).then(function(embed){
//              console.log('oEmbed response: ', embed);
//                elementLoc.html(oEmbed.html);
//            });
//        }
//        if (trackState == "failed"){
//            alert('failed processing :(');
//        }
//    }
    

        

    
    

    
    

    
    
});

//embeds a SC player
   /*SC.oEmbed(track_url, { auto_play: false, iframe: true, maxwidth: 800, maxheight: 200 }, function(oEmbed) {
  console.log('oEmbed response: ', oEmbed);
       player.html(oEmbed.html);
   }); */