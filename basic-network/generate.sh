#!/bin/bash
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

set -e

export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME_FIRST=firstchannel
CHANNEL_NAME_SECOND=secondchannel

# remove previous crypto material and config transactions
rm -rf config
rm -rf crypto-config/*

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

mkdir config

# generate genesis block for orderer
configtxgen -profile FiveOrgOrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate first channel configuration transaction
configtxgen -profile ThreeOrgChannelFirst -outputCreateChannelTx ./config/firstchannel.tx -channelID $CHANNEL_NAME_FIRST
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelFirst -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME_FIRST -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelFirst -outputAnchorPeersUpdate ./config/Org2MSPanchors.tx -channelID $CHANNEL_NAME_FIRST -asOrg Org2MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org2MSP..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelFirst -outputAnchorPeersUpdate ./config/Org4MSPanchors.tx -channelID $CHANNEL_NAME_FIRST -asOrg Org4MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org4MSP..."
  exit 1
fi



# generate second channel configuration transaction
configtxgen -profile ThreeOrgChannelSecond -outputCreateChannelTx ./config/secondchannel.tx -channelID $CHANNEL_NAME_SECOND
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelSecond -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME_SECOND -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi


# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelSecond -outputAnchorPeersUpdate ./config/Org3MSPanchors.tx -channelID $CHANNEL_NAME_SECOND -asOrg Org3MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org3MSP..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgChannelSecond -outputAnchorPeersUpdate ./config/Org5MSPanchors.tx -channelID $CHANNEL_NAME_SECOND -asOrg Org5MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org3MSP..."
  exit 1
fi
