var express = require('express');

var app = express();

app.use(express.static(__dirname + '/../public'));
app.use(express.static(__dirname + '/views'));

var port = process.env.port || 5000;

app.get('/', function (req, res) {
  res.render('index.html');
});

//
app.listen(port, function (err) {
  console.log('Running awsomness on port : ' + port);
});

