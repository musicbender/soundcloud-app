SC.initialize({
    client_id: 'a025d7ac04682146e46fab7dec6d02bd',
    redirect_uri: 'http://127.0.0.1:49392/callback.html'
});

$(document).ready(function(){
    console.log(SC);
    //authenticate and display users information
    $('.connect').click(function(e){
        e.preventDefault();
        SC.connect(function(){
            SC.get('/me', function(me){
                console.log(me);
                $('#username').text(me.username);
                $('#first-name').text(me.first_name);
                $('#last-name').text(me.last_name);
                $('#city').text(me.city);
                $('#track-count').text(me.track_count);
                $('#sc-plan').text(me.plan);
            });
        });
    });
    
    var track_url = 'https://soundcloud.com/patjacobsmusic/ragnarok',
        player = $('.player');
    
   SC.oEmbed(track_url, { auto_play: false, iframe: true, maxwidth: 800, maxheight: 200 }, function(oEmbed) {
  console.log('oEmbed response: ', oEmbed);
       player.html(oEmbed.html);
   }); 
    
    

    
    
});