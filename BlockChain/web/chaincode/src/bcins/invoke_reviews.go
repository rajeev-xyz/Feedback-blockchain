package main

import (
	"encoding/json"

	//"strings"

	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func listReviews(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var status ReviewStatus
	if len(args) > 0 {
		input := struct {
			Status ReviewStatus `json:"status"`
		}{}
		err := json.Unmarshal([]byte(args[0]), &input)
		if err != nil {
			return shim.Error(err.Error())
		}
		status = input.Status
	}

	results := []interface{}{}
	resultsIterator, err := stub.GetStateByPartialCompositeKey(prefixReview, []string{})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		kvResult, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		result := struct {
			UUID string `json:"uuid"`
			*review
		}{}
		err = json.Unmarshal(kvResult.Value, &result)
		if err != nil {
			return shim.Error(err.Error())
		}

		// Skip the processing of the result, if the status
		// does not equal the query status; list all, if unknown
		if result.Status != status && status != ReviewStatusUnknown {
			continue
		}

		// Fetch key
		prefix, keyParts, err := stub.SplitCompositeKey(kvResult.Key)
		if len(keyParts) < 2 {
			result.UUID = prefix
		} else {
			result.UUID = keyParts[1]
		}

		results = append(results, result)
	}

	reviewsAsBytes, err := json.Marshal(results)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(reviewsAsBytes)
}

func fileReview(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	dto := struct {
		UUID         string    `json:"uuid"`
		Date         time.Time `json:"date"`
		Description  string    `json:"description"`
		IsHappy      bool      `json:"is_happy"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	review := review{
		Date:         dto.Date,
		Description:  dto.Description,
		IsHappy:      dto.IsHappy,
		Status:       ReviewStatusNew,
	}
        reviewKey, err := stub.CreateCompositeKey(prefixReview,
		[]string{review.Date.String(), review.Description})
	if err != nil {
		return shim.Error(err.Error())
	}

	// Persist claim
	reviewBytes, err := json.Marshal(review)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(reviewKey, reviewBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}
