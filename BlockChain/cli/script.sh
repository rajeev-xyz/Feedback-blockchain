#!/bin/bash
set -e

CORE_PEER_MSPCONFIGPATH=/peers/ordererOrganizations/orderer-org/orderers/orderer0/msp CORE_PEER_LOCALMSPID="OrdererMSP" peer channel create -o orderer0:7050 -c default -f /peers/orderer/channel.tx --tls true --cafile /peers/orderer/localMspConfig/cacerts/ordererOrg.pem

CORE_PEER_MSPCONFIGPATH=/peers/reviewerPeer/localMspConfig CORE_PEER_ADDRESS=reviewer-peer:7051 CORE_PEER_LOCALMSPID=ReviewerOrgMSP CORE_PEER_TLS_ROOTCERT_FILE=/peers/reviewerPeer/localMspConfig/cacerts/reviewerOrg.pem peer channel join -b default.block

CORE_PEER_MSPCONFIGPATH=/peers/agencyPeer/localMspConfig CORE_PEER_ADDRESS=agency-peer:7051 CORE_PEER_LOCALMSPID=AgencyOrgMSP CORE_PEER_TLS_ROOTCERT_FILE=/peers/agencyPeer/localMspConfig/cacerts/agencyOrg.pem peer channel join -b default.block
