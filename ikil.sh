# simple bash script to kill a CF runtime instance of an app
# usage : ikil.sh <appname> <instance, defaults to 0>

instance=$2
if [ "$instance" = "" ]; 
then
    instance="0"
fi
echo "Killing instance $instance of application $1"
appName=$1
appIDLine=`CF_TRACE=true cf app $appName | grep -E \"url\" | grep -E apps`
tmp=${appIDLine#*/}
appID=${tmp%\"*}
cf curl /$appID/instances/$instance -X 'DELETE'