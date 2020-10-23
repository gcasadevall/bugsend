var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/public'));

app.post('/bug', (req, res) => {
  console.log("datos: "+req.body);
  res.sendStatus(200);
});

app.listen(80, function () {
  console.log('server en puerto 80 !');
});

 