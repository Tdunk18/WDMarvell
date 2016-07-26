<?php

require_once(COMMON_ROOT . '/includes/security.inc');

class NetworkConfiguration{
	var $ifname = '';
	var $iftype = '';
	var $proto = '';
	var $ip = '';
	var $netmask = '';
	var $gateway = '';
	var $dns = Array();
	var $dns0 ='';
	var $dns1 ='';
	var $dns2 ='';
	var $gateway_mac_address='';
	var $iflist = Array();

	function __construct() {
	}

	/* Get a list of the network interfaces */
	function getNetworkConfigs() {
		$ifs = array("eth0", "ath0");
		$numifs = count($ifs);

		for( $i = 0; $i < $numifs; $i++ ) {
			unset($iface);
			$iface = $this->getNetworkConfig($ifs[$i]);
			$this->iflist[$i] = $iface;
		}
		return $this->iflist;

	}

	function getDNSServersForDHCP() {
		$DNSServers = array();
		$settings = file('/etc/resolv.conf');
		foreach($settings as $setting) {
			$keyValue = explode(' ', $setting);
			if ($keyValue[0] == 'nameserver') {
				$DNSServers[] = $keyValue[1];
			}
		}
		return $DNSServers;
	}

	function getDefaultGateway() {
		$output = array();
		$retVal=null;
		exec_runtime("sudo route -n | grep 'UG[ \t]' | awk '{print $2}'",$output, $retVal, false);
		return $output[0];
	}

	function insertConfig($configs){
		$element = array();
	    foreach ($configs as $key=>$value){
	        $name = explode(" ", $value);
	        $element[$name[0]] = $name[1];
	    }
	    return $element;
	}

	function getNetworkConfig( $iname = null /* for backward compatibility */){

		//!!!This where we gather up response
		//!!!Return NULL on error
        //Not using iname anymore
		$this->ifname = '';
		$this->iftype = '';
		$this->proto = '';
		$this->ip = '';
		$this->netmask = '';
		$this->gateway = '';
		$this->dns0 ='';
		$this->dns1 ='';
		$this->dns2 ='';
		$this->gateway_mac_address = '';
		// get the network configuration
		$output=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/getNetworkConfig.sh", $output, $retVal);

		if($retVal !== 0 || empty($output)) {
			return NULL;
		}

		$networkConfig = $output;
		$this->ifname = getDefaultNetworkInterface();
		$this->dns[0] = '';
		$this->dns[1] = '';
		$this->dns[2] = '';

		if (strcasecmp($networkConfig[0], "dhcp") ==0) {

			if(strcmp(getDefaultNetworkInterface(), "wlan0")==0 ) {
				$this->iftype = "wireless";
			}
			else {
				$this->iftype = "wired";
			}

			$this->proto = 'dhcp_client';
			$localIPAndMask = getLocalIpAndMaskFromIfConfig();
			$this->ip = "";  /* Default to a null ip address */
			/* Get the correct IP address for this iface */
			$ifcount = count($localIPAndMask);
			for( $i = 0; $i < $ifcount; $i++ ) {
				$tmpif = $localIPAndMask[$i]['ifacename'];
				//JS - if an interface name is not passed in, select the first one that has a valid IP address
				if ( !isset($iname) || (strcasecmp($tmpif, $iname) == 0) ) {
					if ( !empty($localIPAndMask[$i]['ip']) ) {
						$this->ip = $localIPAndMask[$i]['ip'];
						$this->netmask = $localIPAndMask[$i]['mask'];
						$this->ifname = $localIPAndMask[$i]['ifacename'];
						break;
					}
				}
			}
			if (!empty($iname) && empty($this->ip)) {
				//no match found for interface name passed in, so throw an exception
				throw new \Network\Exception("NETWORK_INTERFACE_NOT_FOUND");
			}

			//get DNS servers
			$dnsArray = $this->getDNSServersForDHCP();
			$dnsIdx = 0;
			foreach($dnsArray as $dnsServer) {
				if ($dnsIdx > 2)
					break;
				$this->dns[$dnsIdx++] = $dnsServer;
			}
			//get Default gateway
			$this->gateway = $this->getDefaultGateway();

			$this->dns0 = $this->dns[0];
			$this->dns1 = $this->dns[1];
			$this->dns2 = $this->dns[2];

			//retrieve access point's MAC address
			$configElement = $this->insertConfig($networkConfig);

			$this->gateway_mac_address = $configElement['gateway_mac_address'];
		}
		else if(strcasecmp($networkConfig[0], "static")==0) {

			if(strcmp(getDefaultNetworkInterface(), "wlan0")==0 ) {
				$this->iftype = "wireless";
			}
			else {
				$this->iftype = "wired";
			}

			$index = 1;
			$this->proto = 'static';
			$ip = explode(" ", $networkConfig[$index]);

			$this->ip = $ip[1];
			$index++;
			$netmask = explode(" ", $networkConfig[$index]);
			$this->netmask = $netmask[1];
			$index++;
			if (isset($networkConfig[$index])){
				$nextArgs = explode(" ", $networkConfig[$index]);
			}
			if (strcasecmp($nextArgs[0], "gateway") === 0){
				if (isset($nextArgs[1])) {
					$this->gateway = $nextArgs[1];
				}
				$index++;
			}
			$dnsIndex = 0;
			do {
				if (isset($networkConfig[$index])){
					$nextArgs = explode(" ",$networkConfig[$index]);
					if(strcasecmp($nextArgs[0], 'nameserver') === 0){
					   $this->dns[$dnsIndex] = $nextArgs[1];
					}
				}
				$index++;
				$dnsIndex++;
			} while (isset($networkConfig[$index]));

			$this->dns0 = $this->dns[0];
			$this->dns1 = $this->dns[1];
			$this->dns2 = $this->dns[2];

			if (isset($networkConfig[$index])){
			    $nextArgs = explode(" ", $networkConfig[$index]);
			}
			if (strcasecmp($nextArgs[0], "gateway_mac_address") === 0){
			    if (isset($nextArgs[1])) {
			        $this->gateway_mac_address = $nextArgs[1];
			    }
			    $index++;
			}

		} else {
			$this->proto = 'disconnected';
		}

		//return NULL;  //Error case
		return( array(
				'ifname' => "$this->ifname",
				'iftype' => "$this->iftype",
				'proto' => "$this->proto",
				'ip' => "$this->ip",
				'netmask' => "$this->netmask",
				'gateway' => "$this->gateway",
				'dns0' => "$this->dns0",
				'dns1' => "$this->dns1",
				'dns2' => "$this->dns2",
		        'gateway_mac_address' => "$this->gateway_mac_address"
		));
	}

	function modifyNetworkConfig($changes, $ifname=null){

		$esc_gateway_mac_address = escapeshellarg($changes['gateway_mac_address']);
		//All script calls are put in background because of the network reset, which send a SIGPIPE to Apache/PHP resulting in retVal 141,
		//hence it is put in background

		if (strcasecmp($changes["proto"], "dhcp_client") == 0) {

			$output=$retVal=null;
			if(strcasecmp($changes['dhcp_mode'], 'renew') == 0){
				exec_runtime("sudo /usr/local/sbin/getNetworkConfig.sh", $output, $retVal);
				if(!$retVal){
					if(strcasecmp($output[0], 'dhcp') == 0){
						exec_runtime("sudo nohup /usr/local/sbin/networkDhcp.sh renew 1>/dev/null &", $output, $retVal, false);
						return 'SUCCESS';
					}
					else{
						return 'BAD_REQUEST';
					}
				}
			}

			$output=$retVal=null;
			if( $ifname != null ) {
				// set the network configuration to DHCP
				$esc_ifname = escapeshellarg("ifname=$ifname");
				exec_runtime("sudo nohup /usr/local/sbin/setNetworkDhcp.sh $esc_ifname $esc_gateway_mac_address 1>/dev/null &", $output, $retVal, false);
			}
			else {
				// set the network configuration to DHCP
 				exec_runtime("sudo nohup /usr/local/sbin/setNetworkDhcp.sh $esc_gateway_mac_address 1>/dev/null &", $output, $retVal, false);
			}
			if($retVal !== 0) {
				return 'SERVER_ERROR';
			}
		}
		else {  // set the network configuration to static
			$esc_ip = escapeshellarg($changes["ip"]);
			$esc_netmask = escapeshellarg($changes["netmask"]);
			$esc_gateway = escapeshellarg($changes["gateway"]);
			$esc_dns0 = escapeshellarg($changes["dns0"]);
			$esc_dns1 = escapeshellarg($changes["dns1"]);
			$esc_dns2 = escapeshellarg($changes["dns2"]);
			if( $ifname != null ) {
				$output=$retVal=null;
				$esc_ifname = escapeshellarg("ifname=$ifname");
 				exec_runtime("sudo nohup /usr/local/sbin/setNetworkStatic.sh $esc_ifname $esc_ip $esc_netmask $esc_gateway $esc_dns0 $esc_dns1 $esc_dns2 $esc_gateway_mac_address 1>/dev/null &", $output, $retVal, false);
				if( $retVal != 0 ) {
					if( $retVal == 3 ) {
						return 'BAD_REQUEST_SAME_NETWORK';
					}
					else {
						return 'BAD_REQUEST';
					}

				}

			}
			/* Keep the old path for backward compatibility */
			else {
				$output=$retVal=null;
 				exec_runtime("sudo nohup /usr/local/sbin/setNetworkStatic.sh $esc_ip $esc_netmask $esc_gateway $esc_dns0 $esc_dns1 $esc_dns2 $esc_gateway_mac_address 1>/dev/null &", $output, $retVal, false);
			}

		}
		return 'SUCCESS';
	}
}