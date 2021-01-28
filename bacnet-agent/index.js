
const axios = require('axios');

let BacnetClient = require('./BacnetClient');

let Device = require('./object/Device');
const logger = require('./logger');

// data update duration in seconds to losant
const UPDATE_DURATION = 300;
const GATEWAY_IP_ADDRESS = 'http://localhost:8084/';
const GATEWAY_IP_ADDRESS_2 = 'http://localhost:8085/';

// Second IP address data delay duration in seconds to losant
const GATEWAY_DELAY = 10;




class BacnetManager {
    /* Starts lisenting to requested server in UDP */
    devices = [];
    constructor() {
        BacnetClient.initialize();
    }
    async sendData(data) {
        try {
    //		logger.info(JSON.stringify(data));
            logger.info('Sending data of device id: ' + data.objectIdentifier);
            let response = await axios.post(GATEWAY_IP_ADDRESS, data);
            logger.info('Response of ' + GATEWAY_IP_ADDRESS + ': ' + JSON.stringify(response.data));
            
        } catch (e) {
            logger.info('Error while sending data to server - ' + GATEWAY_IP_ADDRESS);
            logger.error(e);
        }
        setTimeout(async () => {
            try {
                logger.info('Sending data of device id: ' + data.objectIdentifier);
                let response = await axios.post(GATEWAY_IP_ADDRESS_2, data);
                logger.info('Response of ' + GATEWAY_IP_ADDRESS_2 + ': ' + JSON.stringify(response.data));
            } catch (e) {
                logger.info('Error while sending data to server - ' + GATEWAY_IP_ADDRESS_2);
                logger.error(e);
            }
        }, GATEWAY_DELAY * 1000);
    }
    async monitor() {
        for (let i = 0, length = this.devices.length; i < length; i++) {
            let dev = this.devices[i];
            logger.info('Reading properties for device id: ' + dev.deviceData.objectIdentifier);
            await dev.discoverDataFromDevice();
            await this.sendData(dev.deviceData);
        }
    }
    async start() {
        let that = this;
        // Subscribes to UDP server for device scan.
        logger.info('sending who is', BacnetClient.receiver);
        BacnetClient.client.whoIs(BacnetClient.receiver);

        // Triggered whenever a device is found
        // new device is registered in devices array for property monitoring.
        logger.info("waiting for device response");
        BacnetClient.client.on('iAm', async (msg) => {
            let device = new Device();
            await device.readDeviceInformation(msg);
            that.devices.push(device);
        });
	    // this.monitor();
        // // register monitor schedule
        // setInterval(this.monitor.bind(this), UPDATE_DURATION * 1000);
    }
}

const bm = new BacnetManager();
bm.start();
