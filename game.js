const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerImg = new Image();
playerImg.src = "player.png";

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
};

const snowflakes = [];
const redSnowflakes = [];
const snowflakeSpeed = 2;
const redSnowflakeSpeed = 3;

let score = 0;
let gameRunning = false;
let gameWon = false;

const keys = {};
const playerSpeed = 3;

window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function startGame() {
  resetGame();
  gameRunning = true;
  spawnSnowflakes();
  gameLoop();
  document.getElementById("openingScreen").style.display = "none";
  canvas.style.display = "block";
}

function restartGame() {
  resetGame();
  document.getElementById("deathScreen").style.display = "none";
  startGame();
}

function returnToMenu() {
  resetGame();
  document.getElementById("deathScreen").style.display = "none";
  document.getElementById("openingScreen").style.display = "flex";
  canvas.style.display = "none";
}

function resetGame() {
  snowflakes.length = 0;
  redSnowflakes.length = 0;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 60;
  score = 0;
  gameRunning = false;
  gameWon = false;
}

function spawnSnowflakes() {
  setInterval(() => {
    // White snowflakes
    snowflakes.push({
      x: Math.random() * (canvas.width - 20),
      y: -20,
      width: Math.random() > 0.5 ? 20 : 40, // Small: 20px, Big: 40px
      height: 20,
      color: "#black",
    });

    redSnowflakes.push({
      x: Math.random() * (canvas.width - 20),
      y: -20,
      width: 20,
      height: 20,
      color: "#FF0000",
    });
  }, 1000);
}

function movePlayer() {
  if (keys["ArrowLeft"]) {
    player.x -= playerSpeed;
    if (player.x < 0) player.x = 0; 
  }
  if (keys["ArrowRight"]) {
    player.x += playerSpeed;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width; 
  }
  if (keys["ArrowUp"]) {
    player.y -= playerSpeed;
    if (player.y < 0) player.y = 0; 
  }
  if (keys["ArrowDown"]) {
    player.y += playerSpeed;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height; 
  }
}

function checkCollisions() {
  snowflakes.forEach((snowflake, index) => {
    if (
      player.x < snowflake.x + snowflake.width &&
      player.x + player.width > snowflake.x &&
      player.y < snowflake.y + snowflake.height &&
      player.y + player.height > snowflake.y
    ) {
      score += snowflake.width === 40 ? 5 : 1;
      snowflakes.splice(index, 1);
    }
  });

  redSnowflakes.forEach((red, index) => {
    if (
      player.x < red.x + red.width &&
      player.x + player.width > red.x &&
      player.y < red.y + red.height &&
      player.y + player.height > red.y
    ) {
      endGame(false); 
    }
  });

  if (score >= 500 && !gameWon) {
    endGame(true); 
  }
}

function endGame(won) {
  gameRunning = false;
  gameWon = won;
  document.getElementById("deathScreen").style.display = "flex";
  document.getElementById("finalScore").innerText = won
    ? "Congratulations! You won with 500 points!"
    : `You scored ${score} points. Try again!`;
  canvas.style.display = "none";
}

function update() {
  movePlayer();

  snowflakes.forEach((snowflake) => {
    snowflake.y += snowflakeSpeed + Math.floor(score / 10);
  });

  redSnowflakes.forEach((red) => {
    red.y += redSnowflakeSpeed + Math.floor(score / 10);
  });

  snowflakes.filter((snowflake) => snowflake.y < canvas.height);
  redSnowflakes.filter((red) => red.y < canvas.height);

  checkCollisions();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player as an image
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  snowflakes.forEach((snowflake) => {
    ctx.fillStyle = snowflake.color;
    ctx.beginPath();
    ctx.arc(snowflake.x, snowflake.y, snowflake.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  redSnowflakes.forEach((red) => {
    ctx.fillStyle = red.color;
    ctx.fillRect(red.x, red.y, red.width, red.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

document.getElementById("playButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", restartGame);
document
  .getElementById("menuButton")
  .addEventListener("click", returnToMenu);
