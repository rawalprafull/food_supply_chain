#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

docker-compose -f docker-compose.yml down --volume

docker-compose -f docker-compose.yml stop

./teardown.sh

export COMPOSE_PROJECT_NAME="net"

docker-compose -f docker-compose.yml up -d ca.org1.cts.com ca.org2.cts.com ca.org3.cts.com ca.org4.cts.com ca.org5.cts.com orderer.cts.com peer0.org1.cts.com peer0.org2.cts.com peer0.org3.cts.com peer0.org4.cts.com peer0.org5.cts.com couchdb

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export
# FABRIC_START_TIMEOUT=<larger number>

export FABRIC_CFG_PATH=$PWD

export FABRIC_START_TIMEOUT=15

#echo ${FABRIC_START_TIMEOUT}

sleep ${FABRIC_START_TIMEOUT}


############### first channel #################

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.cts.com/msp" peer0.org1.cts.com peer channel create -o orderer.cts.com:7050 -c firstchannel -f /etc/hyperledger/configtx/firstchannel.tx

# Join peer0.org1.cts.com to the first channel.
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.cts.com/msp" peer0.org1.cts.com peer channel join -b firstchannel.block

# fetch the genesis block for joining 2nd peer to first channel
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.cts.com/msp" peer0.org2.cts.com peer channel fetch 0 firstchannel.block -o orderer.cts.com:7050 -c firstchannel

# join second peer to first channel
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.cts.com/msp" peer0.org2.cts.com peer channel join -b firstchannel.block

#fetch the genesis block for joining 4nd peer to first channel
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.cts.com/msp" peer0.org4.cts.com peer channel fetch 0 firstchannel.block -o orderer.cts.com:7050 -c firstchannel

# join second peer to first channel
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.cts.com/msp" peer0.org4.cts.com peer channel join -b firstchannel.block


############## END first channel #############


############## second channel ################

# Create the second channel
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.cts.com/msp" peer0.org1.cts.com peer channel create -o orderer.cts.com:7050 -c secondchannel -f /etc/hyperledger/configtx/secondchannel.tx

# Join peer0.org1.cts.com to the second channel.
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.cts.com/msp" peer0.org1.cts.com peer channel join -b secondchannel.block

#fetch the genesis block to join 3rd peer to channel
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.cts.com/msp" peer0.org3.cts.com peer channel fetch 0 secondchannel.block -o orderer.cts.com:7050 -c secondchannel

#Join the 3rd peer to the channel
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.cts.com/msp" peer0.org3.cts.com peer channel join -b secondchannel.block

#fetch the genesis block to join 5rd peer to channel
docker exec -e "CORE_PEER_LOCALMSPID=Org5MSP" -e "CORE_PEER_ADDRESS=peer0.org5.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org5.cts.com/msp" peer0.org5.cts.com peer channel fetch 0 secondchannel.block -o orderer.cts.com:7050 -c secondchannel

#Join the 5rd peer to the channel
docker exec -e "CORE_PEER_LOCALMSPID=Org5MSP" -e "CORE_PEER_ADDRESS=peer0.org5.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org5.cts.com/msp" peer0.org5.cts.com peer channel join -b secondchannel.block


############# END second channel ############

docker-compose -f docker-compose.yml up -d cli

sleep 10


############# Install first chaincode #############

# Install chain code on the first channel = Org1
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.cts.com/users/Admin@org1.cts.com/msp" cli peer chaincode install -n mycc -v 1.0 -p github.com/

# Install chain code on the first channel = Org2
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.cts.com/users/Admin@org2.cts.com/msp" cli peer chaincode install -n mycc -v 1.0 -p github.com/

# Install chain code on the second channel = Org3
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.cts.com/users/Admin@org3.cts.com/msp" cli peer chaincode install -n mycc -v 1.0 -p github.com/

# Install chain code on the first channel = Org4
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.cts.com/users/Admin@org4.cts.com/msp" cli peer chaincode install -n mycc -v 1.0 -p github.com/

# Install chain code on the second channel = Org5
docker exec -e "CORE_PEER_LOCALMSPID=Org5MSP" -e "CORE_PEER_ADDRESS=peer0.org5.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.cts.com/users/Admin@org5.cts.com/msp" cli peer chaincode install -n mycc -v 1.0 -p github.com/


# Instantiate  first chaincode on the channel with a sample record for unit testing
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.cts.com/users/Admin@org1.cts.com/msp" cli peer chaincode instantiate -o orderer.cts.com:7050 -C firstchannel -n mycc -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member','Org4MSP.member')"

sleep 10

# Instantiate chain code on the channel with a sample record for unit testing
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.cts.com/users/Admin@org3.cts.com/msp" cli peer chaincode instantiate -o orderer.cts.com:7050 -C secondchannel -n mycc -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org3MSP.member','Org5MSP.member')"

sleep 10

############# START of quering for record #############

# Sample query to test instantiated record query from ledger -------------------> FIRSTCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.cts.com/users/Admin@org1.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C firstchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

#Sample query to test instantiated record query from ledger -------------------> FIRSTCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.cts.com/users/Admin@org2.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C firstchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

#Sample query to test instantiated record query from ledger -------------------> FIRSTCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.cts.com/users/Admin@org4.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C firstchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

# Sample query to test instantiated record query from ledger -------------------> SECONDCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.cts.com/users/Admin@org1.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C secondchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

# Sample query to test instantiated record query from ledger -------------------> SECONDCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.cts.com/users/Admin@org3.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C secondchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

# Sample query to test instantiated record query from ledger -------------------> SECONDCHANNEL
docker exec -e "CORE_PEER_LOCALMSPID=Org5MSP" -e "CORE_PEER_ADDRESS=peer0.org5.cts.com:7051"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.cts.com/users/Admin@org5.cts.com/msp" cli peer chaincode query -o orderer.cts.com:7050 -C secondchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

############# END of query #############
