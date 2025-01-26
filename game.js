document.addEventListener("DOMContentLoaded", function () {
    const backgroundCanvas = document.getElementById("backgroundCanvas");
    const bgCtx = backgroundCanvas.getContext("2d");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;

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
        glowColor: 'transparent',
    };

    let snowflakes = [];
    let redSnowflakes = [];
    const snowflakeSpeed = 2;
    const redSnowflakeSpeed = 3;

    let score = 0;
    let coins = parseInt(localStorage.getItem("coins")) || 0; // Initialize coins from local storage

    let gameRunning = false;
    let gameWon = false;
    let speedBoostActive = false;
    let extraLifeActive = false;

    const keys = {};
    let playerSpeed = 3;
    const speedBoostDuration = 5000; // 5 seconds
    const extraLifeDuration = 3000; // 3 seconds

    let speedBoostTimeout;
    let extraLifeTimeout;
    let snowflakeSpawnInterval;

    const speedBoostIcon = document.getElementById("speedBoostButton");
    const extraLifeIcon = document.getElementById("extraLifeButton");

    updateScoreAndCoinsDisplay();

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true;
        if (e.key.toLowerCase() === "e") {
            buySpeedBoost();
        }
        if (e.key.toLowerCase() === "r") {
            buyExtraLife();
        }
    });

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 20;
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 60;
        backgroundCanvas.width = window.innerWidth;
        backgroundCanvas.height = window.innerHeight;
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
        clearInterval(snowflakeSpawnInterval); 
        snowflakes.length = 0;
        redSnowflakes.length = 0;
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 60;
        score = 0;

        gameRunning = false;
        gameWon = false;
        speedBoostActive = false;
        extraLifeActive = false;
        clearTimeout(speedBoostTimeout);
        clearTimeout(extraLifeTimeout);

        updateScoreAndCoinsDisplay();
    }

    function spawnSnowflakes() {
        const snowflakeCount = parseInt(document.getElementById("snowflakeCount").value) || 5;
        const redSnowflakeCount = parseInt(document.getElementById("redSnowflakeCount").value) || 2;

        snowflakeSpawnInterval = setInterval(() => {
            for (let i = 0; i < snowflakeCount; i++) {
                snowflakes.push({
                    x: Math.random() * (canvas.width - 20),
                    y: -20,
                    radius: Math.random() > 0.5 ? 10 : 20, 
                    color: "#FFFFFF",
                });
            }

            for (let i = 0; i < redSnowflakeCount; i++) {
                redSnowflakes.push({
                    x: Math.random() * (canvas.width - 20),
                    y: -20,
                    radius: 10, 
                    color: "#FF0000",
                });
            }
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
        snowflakes = snowflakes.filter((snowflake) => {
            const snowflakeHitbox = {
                x: snowflake.x,
                y: snowflake.y,
                width: snowflake.radius * 2, 
                height: snowflake.radius * 2, 
            };

            const playerHitbox = {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
            };

            if (isColliding(playerHitbox, snowflakeHitbox)) {
                score += snowflake.radius === 20 ? 5 : 1;
                coins += Math.floor(score / 10);
                localStorage.setItem("coins", coins); // Update local storage
                updateScoreAndCoinsDisplay();
                return false; 
            }
            return true;
        });

        redSnowflakes = redSnowflakes.filter((red) => {
            const redHitbox = {
                x: red.x,
                y: red.y,
                width: red.radius * 2,
                height: red.radius * 2,
            };

            const playerHitbox = {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
            };

            if (isColliding(playerHitbox, redHitbox)) {
                if (extraLifeActive) {
                    // If extra life is active, ignore the collision
                    return false; 
                } else {
                    endGame(false);
                }
            }
            return true; 
        });

        if (score >= 500 && !gameWon) {
            endGame(true);
        }
    }

    function isColliding(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
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

        if (speedBoostActive) {
            player.glowColor = 'rgba(0, 255, 0, 0.5)'; 
        } else if (extraLifeActive) {
            player.glowColor = 'rgba(255, 0, 0, 0.5)'; 
        } else {
            player.glowColor = 'transparent'; 
        }

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

        ctx.shadowColor = player.glowColor; 
        ctx.shadowBlur = 20; 

        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

        snowflakes.forEach((snowflake) => {
            ctx.fillStyle = snowflake.color;
            ctx.beginPath();
            ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        redSnowflakes.forEach((red) => {
            ctx.fillStyle = red.color;
            ctx.beginPath();
            ctx.arc(red.x, red.y, red.radius, 0, Math.PI * 2);
            ctx.fill();
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
            playerSpeed = 6; // Increase player speed
            coins -= 10;
            localStorage.setItem("coins", coins); // Update local storage
            updateScoreAndCoinsDisplay(); 
            speedBoostIcon.disabled = true;

            if (speedBoostTimeout) clearTimeout(speedBoostTimeout); 
            speedBoostTimeout = setTimeout(() => {
                speedBoostActive = false;
                playerSpeed = 3; // Reset player speed
                speedBoostIcon.disabled = false;
            }, speedBoostDuration);
        }
    }

    function buyExtraLife() {
        if (coins >= 20 && !extraLifeActive) {
            extraLifeActive = true;
            coins -= 20;
            localStorage.setItem("coins", coins); // Update local storage
            updateScoreAndCoinsDisplay(); 
            extraLifeIcon.disabled = true;
            player.glowColor = 'rgba(255, 0, 0, 0.5)'; 

            if (extraLifeTimeout) clearTimeout(extraLifeTimeout); 
            extraLifeTimeout = setTimeout(() => {
                extraLifeActive = false;
                extraLifeIcon.disabled = false;
                player.glowColor = 'transparent'; 
            }, extraLifeDuration);
        }
    }

    function toggleShop() {
        const shopModal = document.getElementById("shopModal");
        shopModal.classList.toggle("show");
    }

    document.getElementById("playButton").addEventListener("click", startGame);
    document.getElementById("restartButton").addEventListener("click", () => {
        resetGame(); 
        document.getElementById("deathScreen").style.display = "none"; 
        startGame(); 
    });
    document.getElementById("menuButton").addEventListener("click", () => {
        resetGame(); 
        document.getElementById("deathScreen").style.display = "none";
        document.getElementById("openingScreen").style.display = "block"; 
    });
    document.getElementById("shopIcon").addEventListener("click", toggleShop);
    document.getElementById("closeShopButton").addEventListener("click", toggleShop);
    document.getElementById("speedBoostButton").addEventListener("click", buySpeedBoost);
    document.getElementById("extraLifeButton").addEventListener("click", buyExtraLife);

    let waveOffset = 0;

    function drawBackground() {
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        
        const waveCount = 5; 
        const waveHeight = 20; 
        const waveLength = 200; 

        for (let i = 0; i < waveCount; i++) {
            bgCtx.beginPath();
            bgCtx.moveTo(0, backgroundCanvas.height / 2 + Math.sin((i + waveOffset) * 0.5) * waveHeight);
            
            for (let x = 0; x < backgroundCanvas.width; x++) {
                bgCtx.lineTo(x, backgroundCanvas.height / 2 + Math.sin((x / waveLength) + (i + waveOffset) * 0.5) * waveHeight);
            }
            
            bgCtx.lineTo(backgroundCanvas.width, backgroundCanvas.height);
            bgCtx.lineTo(0, backgroundCanvas.height);
            bgCtx.closePath();
            
            const gradient = bgCtx.createLinearGradient(0, 0, 0, backgroundCanvas.height);
            gradient.addColorStop(0, 'rgba(0, 150, 255, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 100, 200, 0.7)');
            
            bgCtx.fillStyle = gradient;
            bgCtx.fill();
        }

        waveOffset += 0.05;
    }

    function animateBackground() {
        drawBackground();
        requestAnimationFrame(animateBackground);
    }

    animateBackground();
});