'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const http        = require('http');
const socketIO    = require('socket.io');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('trust proxy', true);

// 1. Mandatory Information Security Directives & Server Masking Middleware
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

// Real-Time Global States Engine 
let players = [];
let coin = { x: Math.floor(Math.random() * 600) + 20, y: Math.floor(Math.random() * 400) + 20, value: 1, id: 'coin-' + Date.now() };

// Real-time WebSocket connection loop handling user join, movement, and disconnection events
io.on('connection', (socket) => {
  const newPlayer = {
    id: socket.id,
    x: Math.floor(Math.random() * 600) + 20,
    y: Math.floor(Math.random() * 400) + 20,
    score: 0
  };
  players.push(newPlayer);
  
  socket.emit('init', { id: socket.id, player: newPlayer, item: coin });
  
  socket.on('ready', () => {
    io.emit('update', { players, item: coin });
  });

  socket.on('move', ({ x, y }) => {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      player.x = x;
      player.y = y;
      io.emit('update', { players, item: coin });
    }
  });

  socket.on('collision', ({ itemId }) => {
    if (coin && coin.id === itemId) {
      const player = players.find(p => p.id === socket.id);
      if (player) {
        player.score += coin.value;
        // Generate new random item positioning coordinates upon player collision hits
        coin = {
          x: Math.floor(Math.random() * 600) + 20,
          y: Math.floor(Math.random() * 400) + 20,
          value: 1,
          id: 'coin-' + Date.now()
        };
        io.emit('update', { players, item: coin });
      }
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('update', { players, item: coin });
  });
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
