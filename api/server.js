'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const RateLimit = require('express-rate-limit');

if (process.env.NODE_ENV == 'production') {
  var environment = require('./environments/environment.prod');
  console.log('NODE_ENV: production');
} else {
  var environment = require('./environments/environment');
  console.log('NODE_ENV: development');
}

const scheduledEmails = require('./routes/scheduled-emails');
const privateScheduledEmails = require('./routes/private/scheduled-emails');

const app = express();

app.enable('trust proxy'); // Express will have knowledge that it's sitting behind a proxy

app.use(helmet());

// use it before all route definitions
app.use(cors({ origin: environment.corsDomain }));

var apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 2, // limit each IP to 2 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});

var authenticatePrivateApiKey = function (req, res, next) {
  var apiKey = req.query.apiKey;
  if (apiKey === environment.privateApiKey) {
    next();
  } else {
    res.status(401).json({ error: { message: 'unauthorized' } });
  }
};

//  apply to /api requests
app.use('/api/', apiLimiter);
app.use('/api/scheduled-emails', scheduledEmails);

app.get('/api', function (req, res) {
  res.json({ data: 'email service api', version: environment.version });
});

//  apply to /private-api requests
app.use('/private-api/', authenticatePrivateApiKey);
app.use('/private-api/scheduled-emails', privateScheduledEmails);

app.get('/private-api', function (req, res) {
  res.json({ data: 'email service private api', version: environment.version });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
