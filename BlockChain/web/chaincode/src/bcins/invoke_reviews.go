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
			ID string `json:"id"`
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
			result.ID = prefix
		} else {
			result.ID = keyParts[1]
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
		ID         string    `json:"id"`
		Date         time.Time `json:"date"`
		Description  string    `json:"description"`
		Title	     string `json:"title"`
		IsAnonymous bool `json:"is_anonymous"`
		ReviewForRole SystemRoles `json:"review_for_role"`
		Username string `json:"username"`
		IsPositive      bool      `json:"is_positive"`
		Location string `json:"location"`
		Priority int `json:"priority"`
		Attachment string `json:"attachment"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &dto)
	if err != nil {
		return shim.Error(err.Error())
	}

	review := review{
		Date:         dto.Date,
		Description:  dto.Description,
		IsPositive:      dto.IsPositive,
		Status:       ReviewStatusNew,
		Title:	     dto.Title,
		IsAnonymous:  dto.IsAnonymous,
		ReviewForRole: dto.ReviewForRole,
		Username: dto.Username,
		Location: dto.Location,
		Priority: dto.Priority,
		Attachment: dto.Attachment,
	}
        reviewKey, err := stub.CreateCompositeKey(prefixReview,
		[]string{review.Date.String(), review.Title})
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

func authUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Invalid argument count.")
	}

	input := struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{}

	authenticated := false

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	userKey, err := stub.CreateCompositeKey(prefixUser, []string{input.Username})
	if err != nil {
		return shim.Error(err.Error())
	}
	userBytes, _ := stub.GetState(userKey)
	if len(userBytes) == 0 {
		authenticated = false
	} else {
		user := user{}
		err := json.Unmarshal(userBytes, &user)
		if err != nil {
			return shim.Error(err.Error())
		}
		authenticated = user.Password == input.Password
	}

	authBytes, _ := json.Marshal(authenticated)
	return shim.Success(authBytes)
}
