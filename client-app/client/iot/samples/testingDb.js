var cloudantUserName = "97db821e-87a4-4507-b8ee-fcc95b72b447-bluemix";
var cloudantPassword = "ae34609f865eac5720a3e08c9c0208840a9418090a98f9a4c1fcb9fa5573040b";
var dbCredentials_url = "https://"+cloudantUserName+":"+cloudantPassword+"@"+cloudantUserName+".cloudant.com"; // Set this to your own account

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);

var dbForIot = cloudant.db.use("iot");

var array = ["1","2","3","4"];

// Insert record in db //
var requestDetails = {
            _id: "item_123411",
            Item_status: "",
            temp: array,
            isReceived: "false"
        }
dbForIot.insert(requestDetails, function(err, data) {
    console.log('Error:', err);
    console.log('Data:', data);
  });


// fetch records for db //

dbForIot.get("item_12341", function(err, data) {
	console.log('Data:', data);
	console.log("Updating  data into table");
	var updateddata = {
	    _id: data._id,
	    _rev: data._rev,	
            Item_status: "Waste",
            temp: '1',
            isReceived: "True"
	}
	if(data.isReceived == "false")
	{
		dbForIot.insert(updateddata,function(err,data){
		 	console.log('Error:', err);
			console.log('Data:', data);
		});
	}else{
		console.log("Item is received");
	}
  });


