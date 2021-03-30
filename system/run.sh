#!/bin/bash

export searchLocation="Athens, OH 45701, USA"#"2000 PROSPECT AVE E CLEVELAND OH 44115";
export vaccineLocation="Fruth"#"Wolstein Center"
export snsArn="arn:aws:sns:us-east-1:731744095435:VaccineBot";

unix="$(date +%s)"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ -d "$DIR/logs" ] 
then
	rm -r $DIR/logs
fi

mkdir -p $DIR/logs
logFile="$DIR/logs/$unix.log"

main() {
	cd $DIR/../
	git fetch
	git pull
	cd bot && npx nightwatch vaccine_check.js
}


main 2>&1 | (
    # The INT trap makes sure that logging continues when vetguardian ends in a fault
    # See https://unix.stackexchange.com/questions/407233/how-to-pipe-a-bash-command-and-keep-ctrlc-working
    trap '' INT
    tee $logFile
)