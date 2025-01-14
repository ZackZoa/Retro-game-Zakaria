document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let name = localStorage.getItem("name");
  console.log(name);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const playerImg = new Image();
  playerImg.src = "../retro-images/player.png";

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
  let speedBoostCooldown = false;
  let extraLifeCooldown = false;

  const keys = {};
  let playerSpeed = 3;
  const speedBoostDuration = 5000;
  const extraLifeDuration = 3000;
  const cooldownDuration = 20000;

  let speedBoostTimeout;
  let extraLifeTimeout;

  let speedBoostCount = 0;
  let speedBoostCooldownActive = false;

  const speedBoostCounter = document.createElement("div");
  speedBoostCounter.classList.add("speed-boost-counter");
  document.body.appendChild(speedBoostCounter);

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "e" || e.key === "E") {
      buySpeedBoost();
    }
    if (e.key === "r" || e.key === "R") {
      buyExtraLife();
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

    snowflakes = snowflakes.filter((snowflake) => snowflake.y < canvas.height);
    redSnowflakes = redSnowflakes.filter((red) => red.y < canvas.height);

    checkCollisions();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player.glowEffect) {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 8;
      ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
    }

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

  function updateScoreAndCoinsDisplay() {
    const coinsDisplay = document.getElementById("coinsDisplay");
    if (coinsDisplay) {
      coinsDisplay.innerText = `Coins: ${coins}`;
    }

    const shopCoinsDisplay = document.getElementById("shopCoinsDisplay");
    if (shopCoinsDisplay) {
      shopCoinsDisplay.innerText = `Coins: ${coins}`;
    }
  }

  function openShop() {
    document.getElementById("shopModal").style.display = "flex";
  }

  function closeShop() {
    document.getElementById("shopModal").style.display = "none";
  }

  function buySpeedBoost() {
    if (coins >= 10 && !speedBoostCooldownActive) {
      coins -= 10;
      speedBoostCount++;
      updateScoreAndCoinsDisplay();

      speedBoostCooldownActive = true;
      setTimeout(() => {
        speedBoostCooldownActive = false;
        speedBoostCount = 0;
        updateSpeedBoostCounter();
      }, cooldownDuration);

      playerSpeed *= 2;
      updateSpeedBoostCounter();

      setTimeout(() => {
        playerSpeed /= 2;
      }, speedBoostDuration);
    }
  }

  function updateSpeedBoostCounter() {
    speedBoostCounter.innerText = `Speed Boosts: ${speedBoostCount}`;
  }

  function buyExtraLife() {
    if (coins >= 20 && !extraLifeCooldown) {
      coins -= 20;
      extraLifeActive = true;
      localStorage.setItem("coins", coins);
      updateScoreAndCoinsDisplay();

      extraLifeCooldown = true;
      player.glowEffect = true;
      setTimeout(() => {
        extraLifeCooldown = false;
        extraLifeActive = false;
        player.glowEffect = false;
      }, extraLifeDuration);
    }
  }

  document.getElementById("playButton").addEventListener("click", startGame);
  document.getElementById("restartButton").addEventListener("click", restartGame);
  document.getElementById("menuButton").addEventListener("click", returnToMenu);
  document.getElementById("closeShopButton").addEventListener("click", closeShop);
  document.getElementById("shopIcon").addEventListener("click", openShop);

  const speedBoostIcon = document.createElement("button");
  speedBoostIcon.innerHTML = "⚡";
  speedBoostIcon.classList.add("ability-icon");
  document.body.appendChild(speedBoostIcon);

  const extraLifeIcon = document.createElement("button");
  extraLifeIcon.innerHTML = "❤️";
  extraLifeIcon.classList.add("ability-icon");
  document.body.appendChild(extraLifeIcon);

  speedBoostIcon.addEventListener("click", buySpeedBoost);
  extraLifeIcon.addEventListener("click", buyExtraLife);
});
