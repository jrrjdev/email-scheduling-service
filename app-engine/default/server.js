'use strict';

var path = require('path');
var express = require('express');

var app = express();

function requireHTTPS(req, res, next) {
  if (!req.secure && req.get('X-Forwarded-Proto') !== 'https' && process.env.NODE_ENV !== "development") {
    let domain = req.hostname;

    return res.redirect('https://' + domain + req.url);
  }

  next();
}

app.use(requireHTTPS);

app.use('/', express.static(path.join(__dirname, 'public')));

// Basic error logger/handler
app.use(function (err, req, res, next) {
  res.status(500).send('Something wrong happened!');
  next(err || new Error('Something wrong happened!'));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
