# simple bash script to kill a CF runtime instance of an app
# usage : ikil.sh <appname> <instance, defaults to 0>

appName=$1
instance=$2
if [ "$appName" = "" ]; 
then
    echo "usage : ikil.sh application_name [instance]"
else

	if [ "$instance" = "" ]; 
	then
	    instance="0"
	fi
	echo "Killing instance $instance of application $appName"
	appIDLine=`CF_TRACE=true cf app $appName | grep -E \"url\" | grep -E apps`
	tmp=${appIDLine#*/}
	appID=${tmp%\"*}
	cf -v curl /$appID/instances/$instance -X 'DELETE'
fi