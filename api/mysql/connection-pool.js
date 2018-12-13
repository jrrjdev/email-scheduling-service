'use strict';

var mysql = require('mysql');

if (process.env.NODE_ENV == 'production') {
  var environment = require('../environments/environment.prod');
} else {
  var environment = require('../environments/environment');
}

var connectionPool = mysql.createPool({
  socketPath: environment.mysqlSocketPath,
  host: environment.mysqlHost,
  port: environment.mysqlPort,
  user: environment.mysqlUser,
  password: environment.mysqlPassword,
  database: environment.mysqlDatabase,
  charset: 'utf8mb4',
  timezone: 'utc',
  connectionLimit: 100,
});

console.log('connection-pool.js called');

exports.connectionPool = connectionPool;
