let bacnet = require('node-bacnet');

class BacnetClient {
    static receiver = '192.168.1.9';
    static client = undefined;
    static initialize() {
        if (BacnetClient.client == undefined) {
            this.client = new bacnet({
                port: 47808,
                interface: '0.0.0.0',
                broadcastAddress: '192.168.1.255'
            });
        }
    }
}

module.exports = BacnetClient;
