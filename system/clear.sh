DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ -d "$DIR/logs" ] 
then
	rm -r $DIR/logs
fi