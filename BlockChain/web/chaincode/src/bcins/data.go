package main

import (
	"encoding/json"
	"time"

	//"errors"
	//"github.com/hyperledger/fabric/core/chaincode/shim"
	"strings"
)

type review struct {
	Date time.Time `json:"date"`
	Description string `json:"description"`
	IsHappy bool `json:"is_happy"`
	Status ReviewStatus `json:"status"`
	FileReference string `json:"file_reference"`
}

type ReviewStatus int8

const (
	// The claims status is unknown
	ReviewStatusUnknown ReviewStatus = iota
	// The claim is new
	ReviewStatusNew
	// The claim has been rejected (either by the insurer, or by authorities
	ReviewStatusRejected
	// The item is up for repairs, or has been repaired
	ReviewStatusRepair
	// The customer should be reimbursed, or has already been
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
