$(document).on('ready', () => {

	$('#loginBtn').on('click', () => {
        login();
    });

    $(document).keypress((e) => {
        if(e.which == 13){
            login();
        }
    });
});

const login = () => {
    $.ajax({
        url: '/login',
        type: 'post',
        dataType: 'json',
        data:{
            username: $('#username').val(),
            password: $('#password').val()
        },
        complete: data => {
            if (data.responseText === 'success') {
                window.location.href = "/app";
            }else{
                $('#error_msg').show();
                $('#error_text').text(data.responseText);
            }
        }
    });
}