#!/bin/bash

set -v

rm /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org*/*

rm /tmp/fabric-client-kv-org*/*

rm ~/.hfc-key-store/*

curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=user1&orgName=Org1'

curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=user2&orgName=Org2'

curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=user3&orgName=Org3'

curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=user4&orgName=Org4'

curl -s -X POST http://localhost:4000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=user5&orgName=Org5'

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org1/user1 /home/ubuntu/food_supply_chain/client-app/wallet/user1/

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org2/user2 /home/ubuntu/food_supply_chain/client-app/wallet/user2/

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org3/user3 /home/ubuntu/food_supply_chain/client-app/wallet/user3/

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org4/user4 /home/ubuntu/food_supply_chain/client-app/wallet/user4/

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org5/user5 /home/ubuntu/food_supply_chain/client-app/wallet/user5/

cp /tmp/fabric-client-kv-org1/* /home/ubuntu/food_supply_chain/client-app/wallet/user1/

cp /tmp/fabric-client-kv-org2/* /home/ubuntu/food_supply_chain/client-app/wallet/user2/

cp /tmp/fabric-client-kv-org3/* /home/ubuntu/food_supply_chain/client-app/wallet/user3/

cp /tmp/fabric-client-kv-org4/* /home/ubuntu/food_supply_chain/client-app/wallet/user4/

cp /tmp/fabric-client-kv-org5/* /home/ubuntu/food_supply_chain/client-app/wallet/user5/

cp /tmp/fabric-client-kv-org*/* ~/.hfc-key-store/

cp /home/ubuntu/fabric-samples/balance-transfer/fabric-client-kv-org*/* ~/.hfc-key-store/
