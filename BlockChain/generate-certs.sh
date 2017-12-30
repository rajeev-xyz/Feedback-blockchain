set -e

echo
echo "#################################################################"
echo "#######        Generating cryptographic material       ##########"
echo "#################################################################"
PROJPATH=$(pwd)
CLIPATH=$PROJPATH/cli/peers
ORDERERS=$CLIPATH/ordererOrganizations
PEERS=$CLIPATH/peerOrganizations

rm -rf $CLIPATH
$PROJPATH/bin/cryptogen generate --config=$PROJPATH/crypto-config.yaml --output=$CLIPATH

sh generate-cfgtx.sh

rm -rf $PROJPATH/{orderer,reviewerPeer,agencyPeer}/crypto
mkdir $PROJPATH/{orderer,reviewerPeer,agencyPeer}/crypto
cp -r $ORDERERS/orderer-org/orderers/orderer0/{msp,tls} $PROJPATH/orderer/crypto
cp -r $PEERS/reviewer-org/peers/reviewer-peer/{msp,tls} $PROJPATH/reviewerPeer/crypto
cp -r $PEERS/agency-org/peers/agency-peer/{msp,tls} $PROJPATH/agencyPeer/crypto
cp $CLIPATH/genesis.block $PROJPATH/orderer/crypto/

REVIEWERCAPATH=$PROJPATH/reviewerCA
AGENCYCAPATH=$PROJPATH/agencyCA


rm -rf {$REVIEWERCAPATH,$AGENCYCAPATH}/{ca,tls}
mkdir -p {$REVIEWERCAPATH,$AGENCYCAPATH}/{ca,tls}

cp $PEERS/reviewer-org/ca/* $REVIEWERCAPATH/ca
cp $PEERS/reviewer-org/tlsca/* $REVIEWERCAPATH/tls
mv $REVIEWERCAPATH/ca/*_sk $REVIEWERCAPATH/ca/key.pem
mv $REVIEWERCAPATH/ca/*-cert.pem $REVIEWERCAPATH/ca/cert.pem
mv $REVIEWERCAPATH/tls/*_sk $REVIEWERCAPATH/tls/key.pem
mv $REVIEWERCAPATH/tls/*-cert.pem $REVIEWERCAPATH/tls/cert.pem

cp $PEERS/agency-org/ca/* $AGENCYCAPATH/ca
cp $PEERS/agency-org/tlsca/* $AGENCYCAPATH/tls
mv $AGENCYCAPATH/ca/*_sk $AGENCYCAPATH/ca/key.pem
mv $AGENCYCAPATH/ca/*-cert.pem $AGENCYCAPATH/ca/cert.pem
mv $AGENCYCAPATH/tls/*_sk $AGENCYCAPATH/tls/key.pem
mv $AGENCYCAPATH/tls/*-cert.pem $AGENCYCAPATH/tls/cert.pem

WEBCERTS=$PROJPATH/web/certs
rm -rf $WEBCERTS
mkdir -p $WEBCERTS
cp $PROJPATH/orderer/crypto/tls/ca.crt $WEBCERTS/ordererOrg.pem
cp $PROJPATH/reviewerPeer/crypto/tls/ca.crt $WEBCERTS/reviewerOrg.pem
cp $PROJPATH/agencyPeer/crypto/tls/ca.crt $WEBCERTS/agencyOrg.pem
cp $PEERS/reviewer-org/users/Admin@reviewer-org/msp/keystore/* $WEBCERTS/Admin@reviewer-org-key.pem
cp $PEERS/reviewer-org/users/Admin@reviewer-org/msp/signcerts/* $WEBCERTS/
cp $PEERS/agency-org/users/Admin@agency-org/msp/keystore/* $WEBCERTS/Admin@agency-org-key.pem
cp $PEERS/agency-org/users/Admin@agency-org/msp/signcerts/* $WEBCERTS/
