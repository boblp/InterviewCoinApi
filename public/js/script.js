$(document).on('ready', () => {
    $('select').material_select();

	$('#currency_select').on('change', function(){
        let html = '';
        const currency = $(this).val();
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        $.ajax({
            url: '/get-rate',
            type: 'post',
            dataType: 'json',
            data:{
                currency: currency,
            },
            complete: data => {
                const rates = JSON.parse(data.responseText);

                $('#rates').show();
                $('#rates_data').html();

                for (let i = rates.data.length - 1; i >= 0; i--) {
                    html = html + '<tr><td>'+rates.data[i].coin+'</td><td>'+formatter.format(rates.data[i].rate)+'</td></tr>';
                };

                $('#rates_data').html(html);
            }
        });
    });
});