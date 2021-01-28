let bacnet = require('node-bacnet');

const pi = bacnet.enum.PropertyIdentifier;

const DevicePropertiesArr = [
    pi.OBJECT_IDENTIFIER,
    pi.OBJECT_NAME,
    pi.OBJECT_TYPE,
    pi.SYSTEM_STATUS,
    pi.VENDOR_NAME,
    pi.VENDOR_IDENTIFIER,
    pi.MODEL_NAME,
    pi.FIRMWARE_REVISION,
    pi.APPLICATION_SOFTWARE_VERSION,
    pi.PROTOCOL_VERSION,
    pi.PROTOCOL_SERVICES_SUPPORTED,
    pi.PROTOCOL_OBJECT_TYPES_SUPPORTED,
    pi.OBJECT_LIST,
    pi.MAX_APDU_LENGTH_ACCEPTED,
    // pi.NODE_TYPE
];
const DeviceProperties = [
    { id: pi.OBJECT_IDENTIFIER },
    { id: pi.OBJECT_NAME },
    { id: pi.OBJECT_TYPE },
    { id: pi.SYSTEM_STATUS },
    { id: pi.VENDOR_NAME },
    { id: pi.VENDOR_IDENTIFIER },
    { id: pi.MODEL_NAME },
    { id: pi.FIRMWARE_REVISION },
    { id: pi.APPLICATION_SOFTWARE_VERSION },
    { id: pi.PROTOCOL_VERSION },
    { id: pi.PROTOCOL_SERVICES_SUPPORTED },
    { id: pi.PROTOCOL_OBJECT_TYPES_SUPPORTED }, 
    { id: pi.MAX_APDU_LENGTH_ACCEPTED },
    // { id: pi.OBJECT_LIST },
    // { id: pi.NODE_TYPE },
];

module.exports.objs = DeviceProperties;
module.exports.array = DevicePropertiesArr;