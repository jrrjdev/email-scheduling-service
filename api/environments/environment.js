'use strict';

module.exports = {
    production: false,

    version: 1,

    corsDomain: 'your_local_fontend_url',

    mysqlSocketPath: null,
    mysqlHost: 'your_local_mysql_host',
    mysqlPort: 'your_local_mysql_port',
    mysqlUser: 'your_local_mysql_user',
    mysqlPassword: 'your_local_mysql_password',
    mysqlDatabase: 'your_local_mysql_database',

    privateApiKey: 'your_private_api_key', // for accessing /private-api routes
}
