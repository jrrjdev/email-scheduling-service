'use strict';

module.exports = {
    production: true,

    version: 1,

    corsDomain: process.env.CORS_DOMAIN,

    mysqlSocketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME,
    mysqlHost: null,
    mysqlPort: null,
    mysqlUser: process.env.SQL_USER,
    mysqlPassword: process.env.SQL_PASSWORD,
    mysqlDatabase: process.env.SQL_DATABASE,

    privateApiKey: process.env.PRIVATE_API_KEY,
}
