//SPDX-License-Identifier: Apache-2.0

var assests = require('./controller.js');
var IOTAPIs = require('./client/iot/samples/sharedSubscriptionSample');

var cloudantUserName = "97db821e-87a4-4507-b8ee-fcc95b72b447-bluemix";
var cloudantPassword = "ae34609f865eac5720a3e08c9c0208840a9418090a98f9a4c1fcb9fa5573040b";
var dbCredentials_url = "https://"+cloudantUserName+":"+cloudantPassword+"@"+cloudantUserName+".cloudant.com"; // Set this to your own account

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);
var dbForLogin = cloudant.db.use("iotlogindetails");

module.exports = function(app){

  app.get('/get_record/:reqData?', function(req, res){
    assests.get_record(req, res);
  });

  app.get('/add_record/:tuna?', function(req, res){
    assests.add_record(req, res);
  });

  app.get('/get_all_record/:channelUserPort?', function(req, res){
    assests.get_all_record(req, res);  
  });

  app.get('/change_status/:record_id?', function(req, res){
    assests.change_status(req, res);
  });

  app.get('/sent_item/:shipment?', function(req, res){
      assests.sent_item(req,res);
  });

  app.get('/receive_item/:record?', function(req, res){
      assests.receive_item(req,res);
  });

  app.get('/read_IOT_temp/:record_id?', function(req, res){
    IOTAPIs.start_reading_temp(req,res);
  });

  // for mobile application
  app.get('/getRecordByID/:record_id?',function (req,res){
        req.params.channel = "firstchannel";
        req.params.num = 1;
        var data = assests.getRecordByID(req,res);
        //console.log(JSON.stringify(data));
        //req.params.channel = "secondchannel";
        //assests.getRecordByID(req,res);
        //res.json(JSON.stringify(data));
        //res.json(JSON.parse(data));
        //res.json(data);

   });


  app.get('/login_user/:data', function(req, res){


    console.log("Got a POST request for LoginPage.html page");
    var loginData = req.params.data.split("-");
    var username = loginData[0];
    var password = loginData[1];
    dbForLogin.get(username,function(err, body) {
	console.log(err);
        if (!err) {
            var dbPassword = body.password;
            if (dbPassword === password) {
                var response = {
                    status: 200,
                    message: 'Success',
		    role: body.role	
                }
                res.send(JSON.stringify(response));
            } else {
                var response = {
                    status: 300,
                    message: 'Username and Password does not match'
                }
                res.send(JSON.stringify(response));
            }
        } else {
            var response = {
                status: 400,
                message: 'Username does not exists'
            }
            res.send(JSON.stringify(response));
        }
    });

  });
}
