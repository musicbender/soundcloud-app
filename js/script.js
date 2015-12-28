SC.initialize({
    client_id: 'a025d7ac04682146e46fab7dec6d02bd',
    redirect_uri: 'callback.html'
});

$(document).ready(function(){

    $('a.connect').click(function(e){
        console.log('clicked');
        e.preventDefault();
        SC.connect(function(){
            SC.get('/me', function(me){
                $('#username').text(me.username);
            });
        });
    });

    
    
});