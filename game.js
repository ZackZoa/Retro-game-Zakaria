document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let name = localStorage.getItem("name");
  console.log(name);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const playerImg = new Image();
  playerImg.src = "../Retro-game-Zakaria/retro-images/player.png";

  playerImg.onload = () => {
    document.getElementById("playButton").disabled = false;
  };

  let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    glowEffect: false,
  };

  let snowflakes = [];
  let redSnowflakes = [];
  const snowflakeSpeed = 2;
  const redSnowflakeSpeed = 3;

  let score = 0;
  let coins = parseInt(localStorage.getItem("coins")) || 0;
  let gameRunning = false;
  let gameWon = false;
  let speedBoostActive = false;
  let extraLifeActive = false;
  let speedBoostCooldownActive = false;
  let extraLifeCooldown = false;

  const keys = {};
  let playerSpeed = 3;
  const speedBoostDuration = 5000;
  const extraLifeDuration = 3000;
  const cooldownDuration = 20000;

  let speedBoostTimeout;
  let extraLifeTimeout;

  const speedBoostCounter = document.createElement("div");
  speedBoostCounter.classList.add("speed-boost-counter");
  document.body.appendChild(speedBoostCounter);

  const speedBoostButton = document.getElementById("speedBoostButton");
  const extraLifeButton = document.getElementById("extraLifeButton");

  const speedBoostIcon = document.getElementById("speedBoostIcon");
  const extraLifeIcon = document.getElementById("extraLifeIcon");

  // Initial states for abilities
  let speedBoostAvailable = false;
  let extraLifeAvailable = false;

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "e" || e.key === "E") {
      if (speedBoostAvailable) {
        buySpeedBoost();
      }
    }
    if (e.key === "r" || e.key === "R") {
      if (extraLifeAvailable) {
        buyExtraLife();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
  });

  function startGame() {
    console.log("Starting game...");
    resetGame();
    gameRunning = true;
    spawnSnowflakes();
    gameLoop();
    document.getElementById("openingScreen").style.display = "none";
    canvas.style.display = "block";
  }

  function resetGame() {
    snowflakes.length = 0;
    redSnowflakes.length = 0;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
    score = 0;

    coins = parseInt(localStorage.getItem("coins")) || 0;
    localStorage.setItem("coins", coins);

    gameRunning = false;
    gameWon = false;
    speedBoostActive = false;
    extraLifeActive = false;
    clearTimeout(speedBoostTimeout);
    clearTimeout(extraLifeTimeout);

    updateScoreAndCoinsDisplay();
  }

  function spawnSnowflakes() {
    setInterval(() => {
      snowflakes.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: Math.random() > 0.5 ? 20 : 40,
        height: 20,
        color: "#FFFFFF",
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

        coins += Math.floor(score / 10);
        localStorage.setItem("coins", coins);
        updateScoreAndCoinsDisplay();
      }
    });

    redSnowflakes.forEach((red, index) => {
      if (
        player.x < red.x + red.width &&
        player.x + player.width > red.x &&
        player.y < red.y + red.height &&
        player.y + player.height > red.y
      ) {
        if (extraLifeActive) {
          extraLifeActive = false;
          redSnowflakes.splice(index, 1);
        } else {
          endGame(false);
        }
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

    snowflakes = snowflakes.filter((snowflake) => snowflake.y <= canvas.height);
    redSnowflakes = redSnowflakes.filter((red) => red.y <= canvas.height);
  }

  function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    checkCollisions();

    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    snowflakes.forEach((snowflake) => {
      ctx.fillStyle = snowflake.color;
      ctx.fillRect(snowflake.x, snowflake.y, snowflake.width, snowflake.height);
    });

    redSnowflakes.forEach((red) => {
      ctx.fillStyle = red.color;
      ctx.fillRect(red.x, red.y, red.width, red.height);
    });

    requestAnimationFrame(gameLoop);
  }

  function updateScoreAndCoinsDisplay() {
    document.getElementById("coinsDisplay").textContent = `Coins: ${coins}`;
    document.getElementById("shopCoinsDisplay").textContent = coins;
  }

  function buySpeedBoost() {
    if (coins >= 10 && !speedBoostActive) {
      speedBoostActive = true;
      coins -= 10;
      updateScoreAndCoinsDisplay();
      speedBoostIcon.disabled = true;
      speedBoostTimeout = setTimeout(() => {
        speedBoostActive = false;
        speedBoostIcon.disabled = false;
      }, speedBoostDuration);
    }
  }

  function buyExtraLife() {
    if (coins >= 20) {
      extraLifeActive = true;
      coins -= 20;
      updateScoreAndCoinsDisplay();
      extraLifeIcon.disabled = true;
      extraLifeTimeout = setTimeout(() => {
        extraLifeActive = false;
        extraLifeIcon.disabled = false;
      }, extraLifeDuration);
    }
  }

  function toggleShop() {
    document.getElementById("shopModal").style.display =
      document.getElementById("shopModal").style.display === "block"
        ? "none"
        : "block";
  }

  document.getElementById("playButton").addEventListener("click", startGame);
  document.getElementById("restartButton").addEventListener("click", startGame);
  document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("deathScreen").style.display = "none";
    document.getElementById("openingScreen").style.display = "block";
  });
  document.getElementById("shopIcon").addEventListener("click", toggleShop);
  document.getElementById("closeShopButton").addEventListener("click", toggleShop);
});
