package main

import (
	"encoding/json"
	"time"

	//"errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"strings"
)
type SystemRoles int8

const (
	Citizen SystemRoles = iota
	State
	Municipal
	Police
	Central
)

type review struct {
	Date time.Time `json:"date"`
	Title string `json:"title"`
	Description string `json:"description"`
	IsAnonymous bool `json:"is_anonymous"`
	Location string `json:"location"`
	Priority int `json:"priority"`
	Attachment string `json:"attachment"`
	IsPositive bool `json:"is_positive"`
	Status ReviewStatus `json:"status"`
	FileReference string `json:"file_reference"`
	ReviewForRole SystemRoles `json:"review_for_role"`
	Username string `json:"username"`
}

type user struct {
	Username string `json:"username"`
	Password string `json:"password"`
	FirstName string `json:"name"`
	CellNo string `json:"cell_number"`
	Role SystemRoles `json:"role"`
	ReviewIndex []string `json:"review_index"`
}

type ReviewStatus int8

const (
	ReviewStatusUnknown ReviewStatus = iota
	ReviewStatusNew
	ReviewStatusRejected
	ReviewStatusRepair
	ReviewStatusAck
)

func (s *ReviewStatus) UnmarshalJSON(b []byte) error {
	var value string
	if err := json.Unmarshal(b, &value); err != nil {
		return err
	}

	switch strings.ToUpper(value) {
	default:
		*s = ReviewStatusUnknown
	case "N":
		*s = ReviewStatusNew
	case "J":
		*s = ReviewStatusRejected
	case "R":
		*s = ReviewStatusRepair
	case "F":
		*s = ReviewStatusAck
	}

	return nil
}

func (s ReviewStatus) MarshalJSON() ([]byte, error) {
	var value string

	switch s {
	default:
		fallthrough
	case ReviewStatusUnknown:
		value = ""
	case ReviewStatusNew:
		value = "N"
	case ReviewStatusRejected:
		value = "J"
	case ReviewStatusRepair:
		value = "R"
	case ReviewStatusAck:
		value = "F"
	}

	return json.Marshal(value)
}


func (s *SystemRoles) UnmarshalJSON(b []byte) error {
	var value string
	if err := json.Unmarshal(b, &value); err != nil {
		return err
	}

	switch strings.ToUpper(value) {
	default:
		*s = Citizen
	case "C":
		*s = Central
	case "S":
		*s = State
	case "M":
		*s = Municipal
	case "P":
		*s = Police
	}

	return nil
}

func (s SystemRoles) MarshalJSON() ([]byte, error) {
	var value string

	switch s {
	default:
		fallthrough
	case Citizen:
		value = ""
	case Central:
		value = "C"
	case State:
		value = "S"
	case Municipal:
		value = "M"
	case Police:
		value = "P"
	}

	return json.Marshal(value)
}

func (u *user) Reviews(stub shim.ChaincodeStubInterface) []review {
	reviews := make([]review, 0)

	// for each contractID in user.ContractIndex
	for _, reviewId := range u.ReviewIndex {

		c := &review{}

		// get contract
		reviewAsBytes, err := stub.GetState(reviewId)
		if err != nil {
			//res := "Failed to get state for " + contractID
			return nil
		}

		// parse contract
		err = json.Unmarshal(reviewAsBytes, c)
		if err != nil {
			//res := "Failed to parse contract"
			return nil
		}

		// append to the contracts array
		reviews = append(reviews, *c)
	}

	return reviews
}

