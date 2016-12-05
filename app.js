/**
 * Created by touchaponk on 25/10/2015.
 */
var express = require('express');

var bodyParser = require('body-parser');
var request = require('request');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
var app = express();
//app.get('/', function (req, res) {
//    res.sendFile(path.join(__dirname + '/public/index.html'))
//});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

app.post("/api", function(req, res){
   console.log("api detail is ", req.body);
    req.body.json = true;
    request(req.body, function(err, response, body){
        if(!err){
            res.json(body);
            console.log("response is ",response);
        }
        else{
            res.json(body);
            console.error("error is ",err);
            console.error("response is ",response);
        }
    });
});

var server = app.listen(appEnv.port || 8000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Webui listening at http://%s:%s', host, port);
});