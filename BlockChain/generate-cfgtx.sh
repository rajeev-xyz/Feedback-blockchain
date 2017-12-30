#!/bin/sh

CHANNEL_NAME="default"
PROJPATH=$(pwd)
CLIPATH=$PROJPATH/cli/peers

echo
echo "##########################################################"
echo "#########  Generating Orderer Genesis block ##############"
echo "##########################################################"
$PROJPATH/bin/configtxgen -profile TwoOrgsGenesis -outputBlock $CLIPATH/genesis.block

echo
echo "#################################################################"
echo "### Generating channel configuration transaction 'channel.tx' ###"
echo "#################################################################"
$PROJPATH/bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx $CLIPATH/channel.tx -channelID $CHANNEL_NAME
cp $CLIPATH/channel.tx $PROJPATH/web

echo
echo "#################################################################"
echo "####### Generating anchor peer update for InsuranceOrg ##########"
echo "#################################################################"
$PROJPATH/bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate $CLIPATH/ReviewerOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg ReviewerOrgMSP

echo
echo "#################################################################"
echo "####### Generating anchor peer update for InsuranceOrg ##########"
echo "#################################################################"
$PROJPATH/bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate $CLIPATH/AgencyOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg AgencyOrgMSP
