
// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
const { FileSystemWallet, Gateway } = require('fabric-network');
var path          = require('path');
var util          = require('util');
var os            = require('os');
var IOTStatus 	  = require('./client/iot/samples/sharedSubscriptionSample.js');
const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


module.exports = ( function() {
return{ 
        
	getRecordByID : function(req, res){

                console.log("getting all tuna from database: ");

                // var data = req.params.record_id.split('+');
                var channelName = req.params.channel;
                var record_id = req.params.record_id;
                // var port = data[2]

                var fabric_client = new Fabric_Client();

                // setup the fabric network
                var channel = fabric_client.newChannel(channelName);
                var peer = fabric_client.newPeer('grpc://localhost:7051');

                //var peer = fabric_client.newPeer('grpcs://localhost:7051',{
                //      pem:'/education/LFS171x/fabric-material/basic-network/crypto-config/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem'
                //});

                channel.addPeer(peer);

                //
                var member_user = null;
                var store_path = path.join(os.homedir(), '.hfc-key-store');
                console.log('Store path:'+store_path);
                var tx_id = null;

                // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
                Fabric_Client.newDefaultKeyValueStore({ path: store_path
                }).then((state_store) => {
                    // assign the store to the fabric client
                    fabric_client.setStateStore(state_store);
                    var crypto_suite = Fabric_Client.newCryptoSuite();
                    // use the same location for the state store (where the users' certificate are kept)
                    // and the crypto store (where the users' keys are kept)
                    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
                    crypto_suite.setCryptoKeyStore(crypto_store);
                    fabric_client.setCryptoSuite(crypto_suite);

                    // get the enrolled user from persistence, this user will sign all requests
                    return fabric_client.getUserContext('user1', true);
                }).then((user_from_store) => {
                    if (user_from_store && user_from_store.isEnrolled()) {
                        console.log('Successfully loaded user1 from persistence');
                        member_user = user_from_store;
                    } else {
                        throw new Error('Failed to get user1');
                    }

                    // queryAllRecord - requires no arguments , ex: args: [''],
                    const request = {
                        chaincodeId: 'mycc',
                        txId: tx_id,
                        fcn: 'queryRecord',
                        args: [record_id]
                    };
                     // send the query proposal to the peer
                    return channel.queryByChaincode(request);
		    }).then((query_responses) => {
                    console.log("Query has completed, checking results");
                    // query_responses could have more than one  results if there multiple peers were used as targets
                    if (query_responses && query_responses.length == 1) {
                        if (query_responses[0] instanceof Error) {
                            console.error("error from query = ", query_responses[0]);
                            if(req.params.num==1){

                                req.params.channel = 'secondchannel';
                                req.params.num = 2;
                                this.getRecordByID(req,res);
                            }
                            if(req.params.num==2){
                                res.json(JSON.parse(query_responses[0]));
                            }
                        } else {
                            console.log("Response is ", query_responses[0].toString());
                            res.json(JSON.parse(query_responses[0].toString()));
                      }
                    } else {
                        console.log("No payloads were returned from query");
                    }
                }).catch((err) => {
                    console.error('Failed to query successfully :: ' + err);
                });
    },

    get_all_record: async function(req, res){	

	try {
	
	var data = req.params.channelUserPort.split('+')
                var channelName = data[0]
                var userName = data[1]
                var port = data[2]

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
        await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract('mycc');

        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryAllRecord');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
	res.json(JSON.parse(result.toString()));

    	} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
      }
    }, 
    
    add_record:async  function(req, res){
		
		console.log("submit record: ");

		var array = req.params.tuna.split("-");
		var dateUTC = new Date(); var dateUTC = dateUTC.getTime(); var dateIST = new Date(dateUTC); dateIST.setHours(dateIST.getHours() + 5);  dateIST.setMinutes(dateIST.getMinutes() + 30); 		
		var timestamp1 = dateIST.toLocaleString();
		var timestamp1 = timestamp1.replace(',','');
		
		var key = array[0].toString();		
		var timestamp = timestamp1;
        var deviceId = "Mydevice";
        var price = "$"+array[1]
		var vessel = array[3]
		var channleholder = array[2]
        var arr = channleholder.toString().split("+");
		var supplier = "Alice"
		var distributor = arr[1]
		var channelName = arr[0]	
		var location = array[4]
		var Rstatus = "New";
        var Pstatus = "New";
        
        if(channelName == "firstchannel"){
            var retailer = "John";
        }else {
            var retailer = "Olivia";
        }
  
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
 	                    const result  =  await contract.submitTransaction('addRecord', key, vessel, Rstatus, timestamp, deviceId ,location , price,supplier,distributor,retailer);
                            console.log('Transaction has been submitted');
			    console.log(JSON.parse((result.toString())));	
			   
                            // Disconnect from the gateway.
                            await gateway.disconnect();
		            res.json(JSON.parse((result.toString())));

                        } catch (error) {
                            console.error(`Failed to submit transaction: ${error}`);
                            process.exit(1);
                        }

    },
    
    get_record:async function(req, res){

        var fabric_client = new Fabric_Client();
        var data = req.params.reqData.split('+')
        var channelName = data[0]
        var userName = data[1]
        var port = data[2]

	try{
	// Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            console.log('An identity for the user '+userName+' does not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract('mycc');

        const result = await contract.evaluateTransaction('queryAllRecord');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.json(JSON.parse(result.toString()));

        } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
      }

		
	},
    
    change_status:async  function(req, res){
		

		//var resIOT =  IOTStatus.get_final_status(req,res);
		//console.log(resIOT); 
		//resIOT = JSON.parse(resIOT);               

		var array = req.params.record_id.split("-");
		var key = array[0];
        var confirmedBy = array[2];
		
        var arr = array[1].split("+");
		var channelName = arr[0];
		var userName = arr[1];
		var port = arr[2];
		
		var recordStatus = "Fresh";

		console.log("changing holder of tuna catch: " + recordStatus);
			 
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
                await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork(channelName);

                // Get the contract from the network.
                const contract = network.getContract('mycc');

                const result = await contract.submitTransaction('updateRecordStatus',key, recordStatus,confirmedBy);
                console.log('Transaction has been submitted');
                console.log(JSON.parse(result.toString()));

                // Disconnect from the gateway.
                await gateway.disconnect();

                res.json(JSON.parse(result.toString()));

            } catch (error) {
                console.error(`Failed to submit transaction: ${error}`);
                process.exit(1);
            }
	
			
    },
    
	sent_item: async function(req, res){
		
		var array = req.params.shipment.split("-");
		
		var key = array[0]
		var senttimestamp = array[1]
        var shipmentid = array[2]
		var channelName = array[3]
        var sendTo = array[4]
        var user = array[5]
        var shipmentstatus = "Sent";
		
	
		senttimestamp = senttimestamp.replace(/_/g,'-');	
	
	           try {
                        // Create a new file system based wallet for managing identities.
                        const walletPath = path.join(process.cwd(), 'wallet');
                        const wallet = new FileSystemWallet(walletPath);
                        console.log(`Wallet path: ${walletPath}`);

                        // Check to see if we've already enrolled the user.
                        const userExists = await wallet.exists(user);
                        if (!userExists) {
                            console.log('An identity for the user "user1" does not exist in the wallet');
                            console.log('Run the registerUser.js application before retrying');
                            return;
                        }

                        // Create a new gateway for connecting to our peer node.
                        const gateway = new Gateway();
                        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: false } });

                        // Get the network (channel) our contract is deployed to.
                        const network = await gateway.getNetwork(channelName);

                        // Get the contract from the network.
                        const contract = network.getContract('mycc');

                        const result = await contract.submitTransaction('updateShipmentSentStatus',key,shipmentid ,shipmentstatus,senttimestamp,sendTo);
                        console.log('Transaction has been submitted');
                        console.log(result.toString());

                        // Disconnect from the gateway.
                        await gateway.disconnect();

                        res.json(JSON.parse(result.toString()));

                        } catch (error) {
                            console.error(`Failed to submit transaction: ${error}`);
                            process.exit(1);
                        }	


    },
    
	receive_item: async function(req, res){
		
		var array = req.params.record.split("-");
		
		var key = array[0]
		var shipmentreceivetimestamp = array[1]
		shipmentreceivetimestamp = shipmentreceivetimestamp.replace(/_/g,'-');
	
		var shipmentid = array[2]
		var shipmentstatus = "Delivered";
		var data = array[3].split("+");
		var channelName = data[0]
		var userName = data[1]
		var port1 = data[2]
		var receivedBy = array[4]
		//console.log(key+" "+shipmentreceivetimestamp+" "+shipmentid+" "+shipmentstatus+" "+channelName+" "+userName+" "+port1+" "+port2);

		IOTStatus. Item_receive(shipmentid,res);

			
		//var array = req.params.holder.split("-");
		try {

                  // Create a new file system based wallet for managing identities.
                  const walletPath = path.join(process.cwd(), 'wallet');
                  const wallet = new FileSystemWallet(walletPath);
                  console.log(`Wallet path: ${walletPath}`);

                  // Check to see if we've already enrolled the user.
                  const userExists = await wallet.exists(userName);
                  if (!userExists) {
                      console.log('An identity for the user "user1" does not exist in the wallet');
                      console.log('Run the registerUser.js application before retrying');
                      return;
                  }

                  // Create a new gateway for connecting to our peer node.
                  const gateway = new Gateway();
                  await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: false } });

                  // Get the network (channel) our contract is deployed to.
                  const network = await gateway.getNetwork(channelName);

                  // Get the contract from the network.
                  const contract = network.getContract('mycc');

                  const result = await contract.submitTransaction('updateShipmentReceiveStatus', key,shipmentid,shipmentstatus,shipmentreceivetimestamp,receivedBy);
                  console.log('Transaction has been submitted');
                console.log(result.toString());

                  // Disconnect from the gateway.
                  await gateway.disconnect();
		        res.json(JSON.parse(result.toString()));

              } catch (error) {
                  console.error(`Failed to submit transaction: ${error}`);
                  process.exit(1);
              }
	
	
	}
}
})();
