import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');

let localPlayer;
let allPlayers = [];
let targetItem;

// Listens for connection and maps out initial avatar positioning properties safely
socket.on('init', ({ id, player, item }) => {
  localPlayer = new Player(player);
  targetItem = new Collectible(item);
  socket.emit('ready');
});

socket.on('update', ({ players, item }) => {
  allPlayers = players;
  if (item) targetItem = new Collectible(item);
});

// Capture WASD / Arrow movement keys and pipeline them to the movement matrix handlers
document.addEventListener('keydown', (e) => {
  if (!localPlayer) return;
  
  let dir;
  if (e.key === 'w' || e.key === 'ArrowUp') dir = 'up';
  if (e.key === 's' || e.key === 'ArrowDown') dir = 'down';
  if (e.key === 'a' || e.key === 'ArrowLeft') dir = 'left';
  if (e.key === 'd' || e.key === 'ArrowRight') dir = 'right';
  
  if (dir) {
    localPlayer.movePlayer(dir, 10);
    socket.emit('move', { x: localPlayer.x, y: localPlayer.y });
    
    // Checks for local collection logic hits instantly
    if (localPlayer.collision(targetItem)) {
      socket.emit('collision', { itemId: targetItem.id });
    }
  }
});

// Render logic drawing clean canvas blocks inside a standard animation frame array request loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Background display matrix fill
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Render target coin collectible item block if active
  if (targetItem) {
    ctx.fillStyle = '#gold';
    ctx.beginPath();
    ctx.arc(targetItem.x + 10, targetItem.y + 10, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Render all active online game connections dynamically matching core rankings array
  allPlayers.forEach(p => {
    ctx.fillStyle = p.id === localPlayer?.id ? '#00FF00' : '#FF0000';
    ctx.fillRect(p.x, p.y, 30, 30);
  });
  
  if (localPlayer) {
    ctx.fillStyle = '#FFF';
    ctx.font = '16px sans-serif';
    const currentRank = localPlayer.calculateRank(allPlayers);
    ctx.fillText(currentRank, 20, 30);
  }
  
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
