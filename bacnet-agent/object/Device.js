
let bacnet = require('node-bacnet');
let BacnetClient = require('../BacnetClient');
let DeviceProperties = require('./properties/DeviceProperties');
let ObjectProperties = require('./properties/ObjectProperties');
let PropReader = require('./properties/PropReader');
let DeviceData = require('./DeviceData');
let logger = require('../logger');

class Device {
    prpReader = new PropReader();
    receiver = '';
    deviceData = undefined;
    async getDeviceObjectProps(obj) {
        let p = new Promise((resolve, reject) => {
            let requestArray = [
                { objectId: obj, properties: ObjectProperties.objs}
            ];
            //console.log(JSON.stringify(requestArray));
            BacnetClient.client.readPropertyMultiple(this.receiver, requestArray, (err, value) => {
                // console.log("error", JSON.stringify(err));
                if (err != null) {
                    reject(err);
                }
                // console.log(JSON.stringify(value));
                resolve(value);
            });
        });
        return p;
    }
    async getDeviceProps(dobj) {
        let p = new Promise((resolve, reject) => {
            let requestArray = [
                { objectId: { type: bacnet.enum.ObjectType.DEVICE, instance: dobj.objectIdentifier}, properties: DeviceProperties.objs}
            ];
            BacnetClient.client.readPropertyMultiple(this.receiver, requestArray, (err, value) => {
                resolve(value);
            });
        })
        return p;
    }
    readProps(obj, prps) {
        //console.log(prps);
        let values = prps.values[0].values;
        for (let i = 0, len = values.length; i < len; i++) {
            let propertyInfo = values[i];
            this.prpReader.readValue(obj, propertyInfo);
        }
    }
   
    readExportedData(prop, deviceTracker, data) {
        let obj = {};
        this.readProps(obj, prop);
        
        let pathPPropInd = obj.objectName.lastIndexOf('.');
        let path = obj.objectName.substring(0, pathPPropInd);
        
        if (deviceTracker[path] !== undefined) {
            let deviceInd = deviceTracker[path];
            data[deviceInd][p] = obj.presentValue;
        } else {
            deviceTracker[path] = data.length;
            let device = {};
            let dotBefDev = path.lastIndexOf('.');
            let devPath = path.substring(0, dotBefDev);
            let deviceId = path.substring(dotBefDev + 1, path.length);
            device[p] = obj.presentValue;
            device.id = deviceId;
            device.path = devPath;
            data.push(device);
        }
    }
    async discoverDataFromDevice() {
        let ot = bacnet.enum.ObjectType;
        let objectTypes = [ot.ANALOG_INPUT, ot.BINARY_INPUT, ot.MULTI_STATE_INPUT];
        let data = [];
        let deviceTracker = {};
        for (let j = 0, len = objectTypes.length; j < len; j++) {
            let obj = objectTypes[j];
            let objectId = 0;
            try {
                while (true) {        
                    let k = {
                        type: obj,
                        instance: objectId++
                    };
                    console.log(k);
                    let devObj = await this.getDeviceObjectProps(k);
                    console.log(JSON.stringify(devObj));
                    this.readExportedData(devObj, deviceTracker, data);
                    
                }
            } catch (err) {
                // End of Object list.
            }
        }
        this.deviceData.objects = data;
    }
    async readDeviceInformation(udpMsg) {
        this.deviceData = new DeviceData();
        //console.log('reading device info');
        this.receiver = udpMsg.header.sender.address;
        logger.info('Device discovered - ' + 
            ' - address: ' +  udpMsg.header.sender.address + 
            ' - deviceId: ' +  udpMsg.payload.deviceId + 
            ' - maxApdu: ' +  udpMsg.payload.maxApdu + 
            ' - segmentation: ' +  udpMsg.payload.segmentation + 
            ' - vendorId: ' + udpMsg.payload.vendorId
        );
        this.deviceData.objectIdentifier = udpMsg.payload.deviceId;
        let prps = await this.getDeviceProps(this.deviceData);
        this.readProps(this.deviceData, prps);
    }
}

module.exports = Device;
