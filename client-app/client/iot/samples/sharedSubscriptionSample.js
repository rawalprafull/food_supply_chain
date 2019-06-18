var iotf = require("../");
var express = require('express');
var session = require('express-session');
var app = express();
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var cloudantUserName = "97db821e-87a4-4507-b8ee-fcc95b72b447-bluemix";
var cloudantPassword = "ae34609f865eac5720a3e08c9c0208840a9418090a98f9a4c1fcb9fa5573040b";
var dbCredentials_url = "https://" + cloudantUserName + ":" + cloudantPassword + "@" + cloudantUserName + ".cloudant.com"; // Set this to your own account
var pg = require('pg');
const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const { FileSystemWallet, Gateway } = require('fabric-network');

var pgConString = "postgres://postgres:postgres@localhost:5432/postgres";

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);

var dbForIot = cloudant.db.use("iot");

module.exports = (function () {
    return {

        start_reading_temp: function (req, res) {

            //  app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

            var appClientConfig = {
                org: 'xstg32',
                id: 'xstg32',
                "auth-key": 'a-xstg32-gx3ai4h2hz',
                "auth-token": 'fxszaa)h+wlzJWOkYV',
                "type": "shared" // make this connection as shared subscription
            };

            var appClient = new iotf.IotfApplication(appClientConfig);

            //setting the log level to trace. By default its 'warn'
            appClient.log.setLevel('info');


            response = {};
            response.temp = [];
            response.dateNtime = [];
            response.state;
            var data = req.params.record_id;

            data = JSON.parse(data);
            response.recordId = data.shipmentid;
            response.arrayKeys = data.keys;
            var sendTo = data.sendTo;
            var channelName = data.channelName;

            console.log(response.arrayKeys);


            // Insert new record
            var requestDetails = {
                _id: "item_" + response.recordId,
                Item_status: "New",
                temp: "",
                dateNtime:"",
                tunaKeys: response.arrayKeys,
                isReceived: "false"
            }

            dbForIot.insert(requestDetails, function (err, data) {
                if (!err) {
                    console.log("new Entry is inserted into database with _id item_" + response.recordId);
                } else {
                    console.log("error while inserting the record item_" + response.recordId);
                }

            });

            res.send(null);

            //  session.res = {};
            //  session.res.temp = [];
            //  session.res.state;
            //  session.res.recordId;


            //session.app_Client = appClient;

            appClient.connect();

            appClient.on("connect", function () {
                appClient.subscribeToDeviceEvents();
            });

            appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

                //  console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);

                var json = JSON.parse(payload);

                if (json.temperature > 17) {

                    //res.temp.push(json.temperature);
                    res.state = "Stale";
                    console.log("Rejected : temp =" + JSON.stringify(response));

                    var dateUTC = new Date(); var dateUTC = dateUTC.getTime(); var dateIST = new Date(dateUTC); dateIST.setHours(dateIST.getHours() + 5);  dateIST.setMinutes(dateIST.getMinutes() + 30); 		
                    var timestamp1 = dateIST.toLocaleString();
                    var timestamp1 = timestamp1.replace(',','');


                    // query db check for isReceived
                    var uniqueId = "item_" + response.recordId;

                    dbForIot.get(uniqueId, async function (err, data) {

                        if (data.isReceived == "false" && data.Item_status == "Fresh") {

                            response.temp.push(json.temperature);
                            response.dateNtime.push(timestamp1);
                            response.state = "Stale";
                            console.log("Rejected : temp =" + JSON.stringify(response));

                            var updateddata = {
                                _id: data._id,
                                _rev: data._rev,
                                Item_status: response.state,
                                temp: response.temp,
                                dateNtime:response.dateNtime,
                                tunaKeys: response.arrayKeys,
                                isReceived: "false"
                            }
                            dbForIot.insert(updateddata, function (err, data) {
                                console.log("temp updated and item still not received");
                            });


                            // inserting record in posgres database
                            pg.connect(pgConString, function (err, client) {
                                if (err) {
                                    console.log(err);
                                }

                                client.query("INSERT INTO temp_supplychain(shipmentid,lasttemp,state) values(" + response.recordId + "," + json.temperature + ",'Waste')"

                                    , (err, res) => {


                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("record insertd:" + res);
                                        }

                                        client.end();

                                    });
                            });





                            for (var i = 0; i < response.arrayKeys.length; i++) {
                                var key = response.arrayKeys[i];
                                key = key.toString();
                                var recordStatus = response.state;

                                var txid = await ChangeStateTowaste(key, recordStatus, channelName,sendTo);
                                console.log(txid);

                            }
                        } else {
                            console.log("Disconnecting while = state : Waste & isReceived : true");
                            appClient.disconnect();
                        }
                    });
                    // changing the state of item to waste

                } else {
                    if (response.state != "Stale") {
                        response.state = "Fresh";

                        var dateUTC = new Date(); var dateUTC = dateUTC.getTime(); var dateIST = new Date(dateUTC); dateIST.setHours(dateIST.getHours() + 5);  dateIST.setMinutes(dateIST.getMinutes() + 30); 		
                        var timestamp1 = dateIST.toLocaleString();
                        var timestamp2 = timestamp1.replace(',','');

                        response.temp.push(json.temperature);
                        response.dateNtime.push(timestamp2);
                        // query db check for isReceived
                        uniqueId = "item_" + response.recordId;

                        console.log(response.recordId);

                        dbForIot.get(uniqueId, function (err, data) {
                            if (!err) {
                                if (data.isReceived == "false") {
                                    console.log("Accepted : temp =" + JSON.stringify(response));
                                    var updateddata = {
                                        _id: data._id,
                                        _rev: data._rev,
                                        Item_status: response.state,
                                        temp: response.temp,
                                        dateNtime:response.dateNtime,
                                        tunaKeys: response.arrayKeys,
                                        isReceived: "false"
                                    }
                                    dbForIot.insert(updateddata, function (err, data) {
                                        console.log("temp updated and item still not received");

                                    });
                                } else {
                                    console.log("Disconnecting while = state : Fresh & isReceived : true");
                                    appClient.disconnect();
                                    //res.send("Item isReceived : true");	
                                }
                            }

                        });
                    }
                }
            });
        },

        Item_receive: function (req, res) {

            console.log(req)

            uniqueId = "item_" + req;

            var response = {};

            dbForIot.get(uniqueId, function (err, data) {
                if (!err) {
                    if (data.isReceived == "false") {
                        var updateddata = {
                            _id: data._id,
                            _rev: data._rev,
                            Item_status: data.Item_status,
                            temp: data.temp,
                            dateNtime:data.dateNtime,
                            tunaKeys: data.tunaKeys,
                            isReceived: "true"
                        }
                        dbForIot.insert(updateddata, function (err, data) {
                            console.log("updated as item  received");

                        });

                        // inserting record in posgres database
                        pg.connect(pgConString, function (err, client) {
                            if (err) {
                                console.log(err);
                            }

                            client.query("INSERT INTO temp_supplychain(shipmentid,lasttemp,state) values(" + req + ",'Less then 17','Fresh')"

                                , (err, res) => {


                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("record insertd:" + res);
                                    }

                                    client.end();

                                });
                        });



                        response.status = 200;
                        console.log("updating item received successfully");

                    } else {
                        console.log("Item is already received");
                    }
                } else {
                    console.log("could not able to find the record");
                    response.status = 500;
                }
            });

            //res.send(JSON.stringify(response));
        }
    }
})();



async function ChangeStateTowaste(key, recordStatus, channelName,sendTo, res) {

    try {



        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract('mycc');

        // Submit the specified transaction.
        const result = await contract.submitTransaction('updateRecordStatus', key, recordStatus,sendTo);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }

}
