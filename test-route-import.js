require('ts-node').register();
const { getAcquisitionData } = require('./app/api/analytics/route');
console.log(typeof getAcquisitionData);
