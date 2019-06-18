set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

starttime=$(date +%s)

if [ ! -d ~/.hfc-key-store/ ]; then
        mkdir ~/.hfc-key-store/
fi

# launch network; create channel and join peer to channel
cd ../basic-network
./start.sh


printf "\nTotal execution time : $(($(date +%s) - starttime)) secs ...\n\n"
printf "\n Please do register user to get into the fabric network\n\n"

cd ../tuna-app

