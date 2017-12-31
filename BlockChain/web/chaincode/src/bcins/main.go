package main

import (
	"fmt"

	//"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)
const prefixReview = "review"
const prefixUser = "user"
var logger = shim.NewLogger("main")

type SmartContract struct {
}

var bcFunctions = map[string]func(shim.ChaincodeStubInterface, []string) pb.Response{
		"review_ls":                 listReviews,
		"review_file": fileReview,
}

// Init callback representing the invocation of a chaincode
func (t *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {
	//_, args := stub.GetFunctionAndParameters()

	return shim.Success(nil)
}

// Invoke Function accept blockchain code invocations.
func (t *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	if function == "init" {
		return t.Init(stub)
	}
	bcFunc := bcFunctions[function]
	if bcFunc == nil {
		return shim.Error("Invalid invoke function.")
	}
	return bcFunc(stub, args)
}

func main() {
	logger.SetLevel(shim.LogInfo)

	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
