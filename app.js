require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const bodyParser = require('body-parser');
let client = require('node-rest-client').Client;
client = new client();

console.log('Listening on port: '+process.env.APP_PORT);
server.listen(process.env.APP_PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname+'/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

const session = require("express-session")({
    secret: "my-secret-game_ test",
    resave: true,
    saveUninitialized: true
});

app.use(session);

//Views ***** START *****
app.get('/app', (req, res, next) => {
	if(!req.session.logged){
		return res.redirect('/login');
	}else{
		res.render('app');
	}
});

app.get('/login', (req, res, next) => {
	if(req.session.logged){
		return res.redirect('/app');
	}else{
		res.render('login');
	}
});

app.get('/logout', (req, res, next) => {
	req.session.destroy(err => {
		if(err){ console.log(err) }else{
			return res.redirect('/login');
		}
	});
});
//Views ***** END *****

//API ***** START *****
app.post('/login', (req, res, next) => {
	authenticate(req, response => {
		res.end(response);
	});
});

app.post('/get-rate', (req, res) => {
	try{
		let crypto = '';
		const objResponse = {
			status: '',
			response: '',
			data: []
		};

		if (req.body.currency) {
			crypto = req.body.currency;
		}else{
			const err = new Error('Currency is required');
    		throw err;
		}

		const route = "https://rest.coinapi.io/v1/exchangerate/" + crypto;
		const args = { 
			headers: {'X-CoinAPI-Key': process.env.COINAPI_KEY }
		};

		client.get(route, args, (data, response) => {
			if (Object.keys(data.rates).length === 0) {
				objResponse.response = "Error: Invalid currency";
				objResponse.status = "error";
			}else{
				objResponse.response = "success";
				objResponse.status = "success";
			}

			for (let i = data.rates.length - 1; i >= 0; i--) {
				if (data.rates[i].asset_id_quote == "EUR" ||
					data.rates[i].asset_id_quote == "USD" ||
					data.rates[i].asset_id_quote == "GBP"){

					objResponse.data.push({
						coin: data.rates[i].asset_id_quote, 
						rate: data.rates[i].rate.toFixed(2)
					});
				}
			}

			res.json(objResponse);
		});
	}catch(err){
		console.log(err);
		res.json({
			status: 'error',
			response: err.toString()
		});
	}
});
//API ***** END *****

const authenticate = (req, callback) => {
	if (req.body.username == "admin" && req.body.password == "admin") {
		req.session.logged = true;
		callback('success');
	}else{
		callback('Wrong username or Password.');
	}
};