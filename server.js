'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const http        = require('http');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();
const server = http.createServer(app);

app.set('trust proxy', true);

// Unified Information Security Directives & Server Masking Middleware
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  res._headers = {
    "x-powered-by": "PHP 7.4.3",
    "X-Powered-By": "PHP 7.4.3",
    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block"
  };
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({origin: '*'})); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

fccTestingRoutes(app);
apiRoutes(app);  
    
app.use(function(req, res, next) {
  res.status(404).type('text').send('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:', e);
      }
    }, 1500);
  }
});

module.exports = app;
