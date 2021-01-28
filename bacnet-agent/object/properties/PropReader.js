let bacnet = require('node-bacnet');

let AT = bacnet.enum.ApplicationTag;
let DeviceProperties = require('./DeviceProperties');
let ObjectProperties = require('./ObjectProperties');

let PI = bacnet.enum.PropertyIdentifier;
class PropReader {
    
    readBufferData(bufferObj) {
        let sup = [];
        let buf = bufferObj.value;
        for (let i = 0, len = bufferObj.value.length; i < len; i++) {
            let val = 128;
            let d = buf[i];
            for (let bit = 0, bitLen = 8; bit < bitLen; bit++) {
                sup.push((val & d) == val);
                val /= 2;
            }
        }
        return sup;
    }
    processPropName(propertyInfo) {
        let prop = bacnet.enum.PropertyIdentifierName[propertyInfo.id];
        prop = prop.toLowerCase();
        prop = prop.replace(/_([a-z])/g, function(v, m2) { return m2.toUpperCase(); });
        return prop
    }
    readValue(dobj, propertyInfo) {
	    //console.log(JSON.stringify(dobj));
	    //console.log(JSON.stringify(propertyInfo));
	    try {
            if (propertyInfo.value.length > 0) {
                let applicationTag = propertyInfo.value[0].type;
                let val = propertyInfo.value[0].value;
                if (applicationTag == bacnet.enum.ApplicationTag.ERROR) {
                    // Handling unknown property
                    let prop = bacnet.enum.PropertyIdentifierName[propertyInfo.id];
                                                    
                    if (val['errorClass'] == bacnet.enum.ErrorClass.PROPERTY &&
                        val['errorCode'] == bacnet.enum.ErrorCode.UNKNOWN_PROPERTY) {
                            dobj[prop] = 'unknown-property';
                    } else {
                        let prop = this.processPropName(propertyInfo);
                        dobj[prop] = 'unknown-property';
                    }
                    return;
                }
                switch(propertyInfo.id) {
                    case PI.OBJECT_IDENTIFIER:
                        dobj.objectIdentifier = val.instance;
                        break;
                    case PI.OBJECT_TYPE:
                        dobj.objectType = bacnet.enum.ObjectTypeName[val].toLowerCase();
                        break;
                    case PI.SYSTEM_STATUS:
                        dobj.systemStatus = bacnet.enum.DeviceStatusName[val].toLowerCase();
                        break;
                    case PI.OBJECT_LIST:
                        dobj.objectList = propertyInfo.value;
                        break;
                    case PI.PROTOCOL_SERVICES_SUPPORTED:
                        let osS = this.readBufferData(val);
                        let resSTs = [];
                        for (let i = 0, lo = osS.length; i < lo; i++) {
                            let ots = osS[i];
                            //console.log(ots);
                            if (ots) {
                                resSTs.push(bacnet.enum.ServicesSupportedName[i]);
                            }
                        }
                        dobj.protocolServicesSupported = osS;
                        break;
                    case PI.PROTOCOL_OBJECT_TYPES_SUPPORTED:
                        let obTS = this.readBufferData(val);
                        let resObjTs = [];
                        for (let i = 0, lob = obTS.length; i < lob; i++) {
                            let ots = obTS[i];
                            if (ots) {
                                resObjTs.push(bacnet.enum.ObjectTypesSupportedName[i]);
                            }
                        }
                        dobj.protocolObjetTypesSupported = obTS;
                        break;
                    case PI.STATUS_FLAGS:
                        dobj.statusFlags = this.readBufferData(val);
                    case PI.NETWORK_TYPE:
                        dobj.networkType = bacnet.enum.NetworkTypeName[val].toLowerCase();
                        break;
                    case PI.RELIABILITY:
                        dobj.reliability = bacnet.enum.ReliabilityName[val].toLowerCase();
                        break;
                    case PI.NETWORK_NUMBER_QUALITY:
                        dobj.networkNumberQuality = bacnet.enum.NetworkNumberQualityName[val].toLowerCase();
                        break;
                    case PI.BACNET_IP_MODE:
                        dobj.bacnetIpMode = bacnet.enum.IPModeName[val].toLowerCase();
                        break;
                    case PI.NODE_TYPE:
                        dobj.nodeType = bacnet.enum.NodeTypeName[val].toLowerCase();
                        break;
                    case PI.FILE_ACCESS_METHOD:
                        dobj.fileAccessMethod = bacnet.enum.FileAccessMethodName[val].toLowerCase();
                    default:
                        if (DeviceProperties.array.indexOf(propertyInfo.id) || ObjectProperties.array.indexOf(propertyInfo.id)) {
                            let prop = this.processPropName(propertyInfo);
                            dobj[prop] = val;
                        } else {
                            console.log("Property not supported: " + prop);
                        }
                        break;
                } 
            } else {
                let prop = bacnet.enum.PropertyIdentifierName[propertyInfo.id];
                prop = prop.toLowerCase();
                prop = prop.replace(/_([a-z])/g, function(v, m2) { return m2.toUpperCase(); });
                dobj[prop] = [];
            }
	    } catch(e) {
            console.log(JSON.stringify(propertyInfo));
		    console.log(e);
	    }
    }
}

module.exports = PropReader;