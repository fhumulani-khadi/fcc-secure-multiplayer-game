class Player {
  constructor({ x, y, score = 0, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    // Computes WASD and Arrow key coordinate adjustments (Test 8 & 9)
    if (dir === 'up') this.y -= speed;
    if (dir === 'down') this.y += speed;
    if (dir === 'left') this.x -= speed;
    if (dir === 'right') this.x += speed;
  }

  collision(item) {
    // Intersection math matrix ensuring avatar overlaps item cleanly (Test 12 & 13)
    const avatarSize = 30;
    const itemSize = 20;

    return (
      this.x < item.x + itemSize &&
      this.x + avatarSize > item.x &&
      this.y < item.y + itemSize &&
      this.y + avatarSize > item.y
    );
  }

  calculateRank(arr) {
    // Calculates ranking strictly sorted by score metrics descending (Test 10 & 11)
    const sorted = [...arr].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(p => p.id === this.id) + 1;
    return `Rank: ${rank}/${arr.length}`;
  }
}

export default Player;
