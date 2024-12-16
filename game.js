// Game variables
let player = { x: 400, y: 500, width: 30, height: 30, color: 'blue', speed: 2, dx: 0, dy: 0 };
let snowflakes = [];
let score = 0;
let isGameOver = false;
let isGameWon = false;
let canvas, ctx;

// Set the canvas size dynamically based on the window size
function setCanvasSize() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Helper function to create snowflakes
function createSnowflake() {
  const isWhite = Math.random() > 0.5;
  let snowflake = {
    x: Math.random() * canvas.width,
    y: -10,
    size: Math.random() * 10 + 5,
    speed: Math.random() * 1.5 + 0.5,
    color: isWhite ? 'white' : '#8B0000',
    isWhite: isWhite
  };

  for (let i = 0; i < snowflakes.length; i++) {
    if (Math.abs(snowflake.x - snowflakes[i].x) < 20 && Math.abs(snowflake.y - snowflakes[i].y) < 20) {
      return createSnowflake();
    }
  }
  return snowflake;
}

// Initialize snowflakes
function initializeSnowflakes() {
  for (let i = 0; i < 20; i++) {
    snowflakes.push(createSnowflake());
  }
}

// Handle player movement
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && player.x > 50) {
    player.dx = -player.speed;
  }
  if (e.key === 'ArrowRight' && player.x < canvas.width - player.width - 50) {
    player.dx = player.speed;
  }
  if (e.key === 'ArrowUp' && player.y > 50) {
    player.dy = -player.speed;
  }
  if (e.key === 'ArrowDown' && player.y < canvas.height - player.height - 50) {
    player.dy = player.speed;
  }
});

// Stop player movement when key is released
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    player.dx = 0;
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    player.dy = 0;
  }
});

// Check for collisions with snowflakes
function checkCollision(snowflake) {
  const dx = player.x + player.width / 2 - snowflake.x;
  const dy = player.y + player.height / 2 - snowflake.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (snowflake.size + player.width / 2);
}

// Update the game state
function update() {
  if (isGameOver || isGameWon) return;

  let speedFactor = Math.min(1 + score / 100, 5);

  snowflakes.forEach((snowflake, index) => {
    snowflake.y += snowflake.speed * speedFactor;

    if (checkCollision(snowflake)) {
      if (snowflake.isWhite) {
        score += 1;
        snowflakes[index] = createSnowflake();
      } else {
        isGameOver = true;
      }
    }

    if (snowflake.y > canvas.height) {
      snowflakes[index] = createSnowflake();
    }
  });

  if (score >= 500) {
    isGameWon = true;
  }

  player.x += player.dx;
  player.y += player.dy;

  player.x = Math.max(50, Math.min(player.x, canvas.width - player.width - 50));
  player.y = Math.max(50, Math.min(player.y, canvas.height - player.height -  50));
}

// Render the game
function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  snowflakes.forEach((snowflake) => {
    ctx.fillStyle = snowflake.color;
    ctx.beginPath();
    ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  if (isGameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press F5 to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }

  if (isGameWon) {
    ctx.fillStyle = 'green';
    ctx.font = '40px Arial';
    ctx.fillText('YOU WIN!', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press F5 to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
  console.log("Game is starting..."); // Debugging log
  document.getElementById('openingScreen').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  setCanvasSize();
  initializeSnowflakes(); // Initialize snowflakes after setting canvas size
  gameLoop();
}

// Event listener for Play button
document.getElementById('playButton').addEventListener('click', () => {
  console.log("Play button clicked!"); // Debugging log
  startGame();
});

// Adjust canvas size when the window is resized
window.addEventListener('resize', setCanvasSize);