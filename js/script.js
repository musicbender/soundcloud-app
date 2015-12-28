SC.initialize({
    client_id: 'a025d7ac04682146e46fab7dec6d02bd',
    redirect_uri: 'http://127.0.0.1:49392/callback.html'
});

$(document).ready(function(){

    $('.connect').click(function(e){
        console.log('clicked');
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

    
    
});