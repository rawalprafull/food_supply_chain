package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
//	"github.com/op/go-logging"
)

type SmartContract struct {
}


type Distributor struct{
        SupplierName  string `json:"suppliername"`
	DistributorName string `json:s"distributorname"`
	RetailerName string `json:s"retailername"`
	DeviceId  string `json:"deviceid"`
	ShipmentId string `json:"shipmentid"`
	ShipmentStatus string `json:"shipmentstatus"`
	ShipmentSentTimestamp string `json: "shipmentsenttimestamp"`
        ShipmentReceiveTimestamp string `json: "shipmentreceivetimestamp"`
}

type Retailer struct{
        SupplierName  string `json:"suppliername"`
	DistributorName string `json:s"distributorname"`
	RetailerName string `json:s"retailername"`
	DeviceId  string `json:"deviceid"`
	ShipmentId string `json:"shipmentid"`
	ShipmentStatus string `json:"shipmentstatus"`
	ShipmentSentTimestamp string `json: "shipmentsenttimestamp"`
        ShipmentReceiveTimestamp string `json: "shipmentreceivetimestamp"`
}

type Food struct {
	Vessel string `json:"vessel"`
	Status  string `json:"status"`
	Price string `json:"price"`
	Timestamp string `json:"timestamp"`
	Location  string `json:"location"`
	Distributor Distributor `json:"suppiler"`
	Retailer Retailer `json:"retailer"`
}

//var logger = shim.MustGetLogger("mycc")


func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success([]byte(APIstub.GetTxID()))
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryRecord" {
		return s.queryRecord(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "addRecord" {
		return s.addRecord(APIstub, args)
	} else if function == "queryAllRecord" {
		return s.queryAllRecord(APIstub)
	} else if function == "updateRecordStatus" {
		return s.updateRecordStatus(APIstub, args)
	}else if function == "updateShipmentSentStatus" {
		return s.updateShipmentSentStatus(APIstub, args)
	}else if function == "updateShipmentReceiveStatus" {
                return s.updateShipmentReceiveStatus(APIstub, args)
        }


	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryRecord(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	foodAsBytes, _ := APIstub.GetState(args[0])
	if foodAsBytes == nil {
		return shim.Error("Could not locate food")
	}

	return shim.Success(foodAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) pb.Response {
	
	var distributor Distributor
	distributor.SupplierName = "TestS"
	distributor.DistributorName = "TestD"
	distributor.RetailerName = "TestR" 
	distributor.DeviceId = "Test"
	distributor.ShipmentId = "Test"
	distributor.ShipmentStatus = "Test"
	distributor.ShipmentSentTimestamp = "Test"
	distributor.ShipmentReceiveTimestamp = "Test"


	var retailer Retailer 
	retailer.SupplierName = "TestS"
	retailer.DistributorName = "TestD"
	retailer.RetailerName = "TestR" 
	retailer.DeviceId = "Test"
	retailer.ShipmentId = "Test"
	retailer.ShipmentStatus = "Test"
	retailer.ShipmentSentTimestamp = "Test"
	retailer.ShipmentReceiveTimestamp = "Test"


	
	food := []Food{
		Food{ Vessel: "923F",
		Status: "New",
		Price: "$2",
		Timestamp: "2018-10-22 15:02:44",
		Location: "51.9435, 8.2735",
		Distributor: distributor,
		Retailer: retailer},
	}

	i := 0
	for i < len(food) {
		fmt.Println("i is ", i)
		foodAsBytes, _ := json.Marshal(food[i])
		APIstub.PutState(strconv.Itoa(i+1), foodAsBytes)
		fmt.Println("Added", food[i])
		i = i + 1
	}

	txId := APIstub.GetTxID()

        fmt.Sprintf("transaction id :--------"+ txId);

        bs, _ := json.Marshal(txId)

        return shim.Success(bs)
}

func (s *SmartContract) addRecord(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 9 {
		return shim.Error("Incorrect number of arguments. Expecting 9")
	}

	var distributor Distributor
	distributor.SupplierName = args[7]
	distributor.DistributorName = args[8]
	distributor.RetailerName = " " 
	distributor.DeviceId = args[4]
	distributor.ShipmentId = " "
	distributor.ShipmentStatus = " "
	distributor.ShipmentSentTimestamp = " "
	distributor.ShipmentReceiveTimestamp = " "


	var retailer Retailer
	retailer.SupplierName = args[7]
	retailer.DistributorName = args[8]
	retailer.RetailerName = " " 
	retailer.DeviceId = args[4]
	retailer.ShipmentId = " "
	retailer.ShipmentStatus = " "
	retailer.ShipmentSentTimestamp = " "
	retailer.ShipmentReceiveTimestamp = " "
	

	var food = Food{Vessel: args[1],Status: args[2], Timestamp: args[3],Location :args[5],Price: args[6],Distributor:distributor,Retailer:retailer}

	foodAsBytes, _ := json.Marshal(food)
	err := APIstub.PutState(args[0], foodAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record food catch: %s", args[0]))
	}

        //txIdAsBytes := APIstub.GetTxID()
	// if txIdAsBytes == nil {
        //        return shim.Error(fmt.Sprintf("Transaction Id not generated"))
        //}
	txId := APIstub.GetTxID()

	fmt.Sprintf("transaction id :--------"+ txId);

	bs, _ := json.Marshal(txId)

	return shim.Success(bs)
}

func (s *SmartContract) queryAllRecord(APIstub shim.ChaincodeStubInterface) pb.Response {

	startKey := "1545887530570"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllRecord:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) updateRecordStatus(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	foodAsBytes, _ := APIstub.GetState(args[0])
	if foodAsBytes == nil {
		return shim.Error("Could not locate item")
	}
	food := Food{}

	json.Unmarshal(foodAsBytes, &food)
	// Normally check that the specified argument is a valid holder of food
	// we are skipping this check for this example
	food.Status = args[1]

	foodAsBytes, _ = json.Marshal(food)
	err := APIstub.PutState(args[0], foodAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to change item status: %s", args[0]))
	}

	txId := APIstub.GetTxID()

	fmt.Printf("txId while updating record %s",txId)
//	logger.Debugf("txId while updating record %s",txId)

        bs, _ := json.Marshal(txId)

        return shim.Success(bs)

}

 func (s *SmartContract) updateShipmentSentStatus(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 4444")
	}


	foodAsBytes, _ := APIstub.GetState(args[0])
        if foodAsBytes == nil {
                return shim.Error("Could not locate item")
        }
        food := Food{}

        json.Unmarshal(foodAsBytes, &food)
        // Normally check that the specified argument is a valid holder of food
	// we are skipping this check for this example
	
	if args[4] == "Distributor" {
		food.Distributor.ShipmentId = args[1]
		food.Distributor.ShipmentStatus = args[2]
		food.Distributor.ShipmentSentTimestamp = args[3]
	}else{

		food.Retailer.ShipmentId = args[1]
		food.Retailer.ShipmentStatus = args[2]
		food.Retailer.ShipmentSentTimestamp = args[3]
	}

        foodAsBytes, _ = json.Marshal(food)
        err := APIstub.PutState(args[0], foodAsBytes)
        if err != nil {
                return shim.Error(fmt.Sprintf("Failed to change item status: %s", args[0]))
        }

	txId := APIstub.GetTxID()
        bs, _ := json.Marshal(txId)
        return shim.Success(bs)
}

 func (s *SmartContract) updateShipmentReceiveStatus(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

        if len(args) != 5 {
                return shim.Error("Incorrect number of arguments. Expecting 4")
        }


        foodAsBytes, _ := APIstub.GetState(args[0])
        if foodAsBytes == nil {
                return shim.Error("Could not locate item")
        }
        food := Food{}


        json.Unmarshal(foodAsBytes, &food)
        // Normally check that the specified argument is a valid holder of food
        // we are skipping this check for this example 

	

		if args[4] == "Distributor" {

			if food.Distributor.ShipmentId == args[1] {
			
				food.Distributor.ShipmentStatus = args[2]
				food.Distributor.ShipmentSentTimestamp = args[3]
			}
		}else{
			if food.Retailer.ShipmentId == args[1] {
		
				food.Retailer.ShipmentStatus = args[2]
				food.Retailer.ShipmentSentTimestamp = args[3]
			}
		}
	

        foodAsBytes, _ = json.Marshal(food)
        err := APIstub.PutState(args[0], foodAsBytes)
        if err != nil {
                return shim.Error(fmt.Sprintf("Failed to change item status: %s", args[0]))
        }

	txId := APIstub.GetTxID()
        bs, _ := json.Marshal(txId)
        return shim.Success(bs)

}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	//logger.SetLevel(shim.LogInfo)
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
