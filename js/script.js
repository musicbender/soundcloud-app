SC.initialize({
    client_id: 'a025d7ac04682146e46fab7dec6d02bd',
    redirect_uri: 'http://musicbender.github.io/soundcloud-app/callback.html'
});

$(document).ready(function(){
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
 /*   
SC.connect().then(function() {
  return SC.get('/me');
}).then(function(me) {
  alert('Hello, ' + me.username);
});*/
    
    var track_url = 'https://soundcloud.com/patjacobsmusic/ragnarok',
        playerDiv = $('.player');
    
    $('#play').click(function(){
        SC.stream(track_url).then(function(player){
            console.log(player);
            player.start();
        });
    });
    

    
    

    
    
});

//embeds a SC player
   /*SC.oEmbed(track_url, { auto_play: false, iframe: true, maxwidth: 800, maxheight: 200 }, function(oEmbed) {
  console.log('oEmbed response: ', oEmbed);
       player.html(oEmbed.html);
   }); */