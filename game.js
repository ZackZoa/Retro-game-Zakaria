document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 20;

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

  const keys = {};
  let playerSpeed = 3;
  const speedBoostDuration = 5000;
  const extraLifeDuration = 3000;
  const cooldownDuration = 20000;

  let speedBoostTimeout;
  let extraLifeTimeout;

  const speedBoostIcon = document.getElementById("speedBoostButton");
  const extraLifeIcon = document.getElementById("extraLifeButton");

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
      player.x = Math.max(0, player.x - playerSpeed);
    }
    if (keys["ArrowRight"]) {
      player.x = Math.min(canvas.width - player.width, player.x + playerSpeed);
    }
    if (keys["ArrowUp"]) {
      player.y = Math.max(0, player.y - playerSpeed);
    }
    if (keys["ArrowDown"]) {
      player.y = Math.min(canvas.height - player.height, player.y + playerSpeed);
    }
  }

  function checkCollisions() {
    snowflakes = snowflakes.filter((snowflake, index) => {
      if (
        player.x < snowflake.x + snowflake.width &&
        player.x + player.width > snowflake.x &&
        player.y < snowflake.y + snowflake.height &&
        player.y + player.height > snowflake.y
      ) {
        score += snowflake.width === 40 ? 5 : 1;
        coins += Math.floor(score / 10);
        localStorage.setItem("coins", coins);
        updateScoreAndCoinsDisplay();
        return false; 
      }
      return true;
    });

    redSnowflakes = redSnowflakes.filter((red, index) => {
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
        return false; 
      }
      return true;
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

      if (speedBoostTimeout) clearTimeout(speedBoostTimeout); 
      speedBoostTimeout = setTimeout(() => {
        speedBoostActive = false;
        speedBoostIcon.disabled = false;
      }, speedBoostDuration);
    }
  }

  function buyExtraLife() {
    if (coins >= 20 && !extraLifeActive) {
      extraLifeActive = true;
      coins -= 20;
      updateScoreAndCoinsDisplay();
      extraLifeIcon.disabled = true;

      if (extraLifeTimeout) clearTimeout(extraLifeTimeout); 
      extraLifeTimeout = setTimeout(() => {
        extraLifeActive = false;
        extraLifeIcon.disabled = false;
      }, extraLifeDuration);
    }
  }

  function toggleShop() {
    const shopModal = document.getElementById("shopModal");
    shopModal.classList.toggle("show");
  }

  document.getElementById("playButton").addEventListener("click", startGame);
  document.getElementById("restartButton").addEventListener("click", startGame);
  document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("deathScreen").style.display = "none";
    document.getElementById("openingScreen").style.display = "block";
  });
  document.getElementById("shopIcon").addEventListener("click", toggleShop);
  document.getElementById("closeShopButton").addEventListener("click", toggleShop);
  document.getElementById("speedBoostButton").addEventListener("click", buySpeedBoost);
  document.getElementById("extraLifeButton").addEventListener("click", buyExtraLife);
});
