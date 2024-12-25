let player1Img;
let player1MovingImg;
let player2Img;
let player2MovingImg;
let backgroundImg;
let bulletImg; // 子彈圖片

// 玩家1和玩家2的血量
let player1Health = 100;
let player2Health = 100;

// 玩家1和玩家2的初始位置（重生點）
const player1RespawnX = 250;
const player1RespawnY = 650;
const player2RespawnX = 1480;
const player2RespawnY = 650;

// 玩家1和玩家2的位置
let player1X = player1RespawnX;
let player1Y = player1RespawnY;
let player2X = player2RespawnX;
let player2Y = player2RespawnY;

// 玩家的大小
let playerWidth = 341 / 5;
let playerHeight = 104;

// 玩家速度
let player1SpeedX = 0;
let player1SpeedY = 0;
let player2SpeedX = 0;
let player2SpeedY = 0;

// 子彈陣列
let bullets = [];

// 用於切割圖片的參數
let spriteWidth = 50; // 每一格的寬度
let spriteHeight = 100; // 每一格的高度
let player1SpriteIndex = 0; // 玩家1當前顯示的圖片格
let player2SpriteIndex = 0; // 玩家2當前顯示的圖片格
let animationFrame = 0; // 用於控制動畫速度

// 玩家1與玩家2的面向方向 (1為右，-1為左)
let player1Direction = 1;
let player2Direction = 1;

// 子彈碰撞範圍放大倍數
let collisionSizeMultiplier = 5; // 調整此參數以放大子彈碰撞範圍

// 遊戲狀態
let gameOver = false;
let winner = "";

function preload() {
  player1Img = loadImage('player1.png', imgLoaded, imgLoadError);
  player1MovingImg = loadImage('player1_moving.png', imgLoaded, imgLoadError);
  player2Img = loadImage('player2.png', imgLoaded, imgLoadError);
  player2MovingImg = loadImage('player2_moving.png', imgLoaded, imgLoadError);
  backgroundImg = loadImage('background.jpg', imgLoaded, imgLoadError);
  bulletImg = loadImage('bullet.png', imgLoaded, imgLoadError); // 加載子彈圖片
}

function imgLoaded() {
  console.log("圖片加載完成");
}

function imgLoadError() {
  console.error("圖片加載失敗");
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 設置全螢幕
  frameRate(60); // 提高畫面更新頻率
}

function draw() {
  if (!player1Img || !player1MovingImg || !player2Img || !player2MovingImg || !backgroundImg || !bulletImg) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    text("圖片加載中...", width / 2, height / 2);
    return;
  }

  if (gameOver) {
    displayGameOver();
    return;
  }

  image(backgroundImg, 0, 0, width, height);

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("TKUED", width / 2, height / 4);
  textSize(20);
  text("玩家一遊戲操作方式： " ,125, 80);
  text("W - 上移",  110, 100);
  text("S - 下移",  110, 120);
  text("A - 左移",  110, 140);
  text("D - 右移",  110, 160);
  text("空白鍵 - 發射子彈",  110, 180);

  text("玩家二遊戲操作方式：" , width - 200, 80);
  text( " ↑ - 上移",  width - 200, 100);
  text("↓ - 下移",  width - 200, 120);
  text("← - 左移",  width - 200, 140);
  text("→ - 右移",  width - 200, 160);
  text("Enter鍵 - 發射子彈",  width - 200, 180);

  textSize(20);
  text("玩家一血量: " + player1Health, 120, 50);
  text("玩家二血量: " + player2Health, width - 200, 50);



  drawPlayer(
    player1SpeedX !== 0 || player1SpeedY !== 0 ? player1MovingImg : player1Img,
    5,
    player1X,
    player1Y,
    player1Direction,
    player1SpriteIndex,
    30
  );
  drawPlayer(
    player2SpeedX !== 0 || player2SpeedY !== 0 ? player2MovingImg : player2Img,
    3,
    player2X,
    player2Y,
    player2Direction,
    player2SpriteIndex,
    30
  );

  updatePlayers();
  updateBullets();
  checkGameOver();
}

function drawPlayer(img, frame, x, y, direction, spriteIndex, speed) {
  let spriteWidthA = img.width / frame;
  let spriteHeightA = img.height;
  playerWidth = spriteWidthA;
  playerHeight = spriteHeightA;

  if (animationFrame % speed === 0) {
    if (spriteIndex < frame - 3) {
      spriteIndex++;
    } else {
      spriteIndex = 0;
    }
    player1SpriteIndex = spriteIndex;
    player2SpriteIndex = spriteIndex;
  }

  let sx = spriteIndex * spriteWidthA;
  push();
  translate(x + spriteWidthA / 2, y + spriteHeightA / 2);
  scale(direction, 1);
  image(img, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight, sx, 0, spriteWidthA, spriteHeightA);
  pop();
  animationFrame++;
}

function updatePlayers() {
  player1X += player1SpeedX;
  player1Y += player1SpeedY;

  player2X += player2SpeedX;
  player2Y += player2SpeedY;

  player1X = constrain(player1X, 0, width - playerWidth);
  player1Y = constrain(player1Y, 0, height - playerHeight);

  player2X = constrain(player2X, 0, width - playerWidth);
  player2Y = constrain(player2Y, 0, height - playerHeight);
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.speedX;
    bullet.y += bullet.speedY;

    image(bulletImg, bullet.x, bullet.y - 10, bullet.size * 2, bullet.size * 2); // 使用圖片顯示子彈，位置向上調整

    if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
      bullets.splice(i, 1);
    } else {
      if (
        bullet.owner === 1 &&
        dist(bullet.x, bullet.y, player2X + playerWidth / 2, player2Y + playerHeight / 2) < bullet.size * collisionSizeMultiplier
      ) {
        player2Health -= 10;
        bullets.splice(i, 1);
      } else if (
        bullet.owner === 2 &&
        dist(bullet.x, bullet.y, player1X + playerWidth / 2, player1Y + playerHeight / 2) < bullet.size * collisionSizeMultiplier
      ) {
        player1Health -= 10;
        bullets.splice(i, 1);
      }
    }
  }

  player1Health = max(player1Health, 0);
  player2Health = max(player2Health, 0);
}

function checkGameOver() {
  if (player1Health <= 0) {
    gameOver = true;
    winner = "玩家二獲勝！";
  } else if (player2Health <= 0) {
    gameOver = true;
    winner = "玩家一獲勝！";
  }
}

function displayGameOver() {
  background(0);
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text(winner, width / 2, height / 2 - 50);
  textSize(20);
  text("按 R 鍵重新開始", width / 2, height / 2 + 50);
}

function keyPressed() {
  if (gameOver && keyCode === 82) {
    resetGame();
    return;
  }

  if (keyCode === 65) {
    player1SpeedX = -5;
    player1Direction = -1;
  }
  if (keyCode === 68) {
    player1SpeedX = 5;
    player1Direction = 1;
  }
  if (keyCode === 87) {
    player1SpeedY = -5;
  }
  if (keyCode === 83) {
    player1SpeedY = 5;
  }

  if (keyCode === LEFT_ARROW) {
    player2SpeedX = -5;
    player2Direction = -1;
  }
  if (keyCode === RIGHT_ARROW) {
    player2SpeedX = 5;
    player2Direction = 1;
  }
  if (keyCode === UP_ARROW) {
    player2SpeedY = -5;
  }
  if (keyCode === DOWN_ARROW) {
    player2SpeedY = 5;
  }

  if (keyCode === 32) {
    bullets.push({
      x: player1X + playerWidth / 2,
      y: player1Y + playerHeight / 2 - 20,
      speedX: player1Direction * 10,
      speedY: 0,
      size: 10,
      owner: 1
    });
  }

  if (keyCode === RETURN) {
    bullets.push({
      x: player2X + playerWidth / 2,
      y: player2Y + playerHeight / 2 - 20,
      speedX: player2Direction * 10,
      speedY: 0,
      size: 10,
      owner: 2
    });
  }
}

function keyReleased() {
  if (keyCode === 65 || keyCode === 68) player1SpeedX = 0;
  if (keyCode === 87 || keyCode === 83) player1SpeedY = 0;

  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) player2SpeedX = 0;
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) player2SpeedY = 0;
}

function resetGame() {
  player1Health = 100;
  player2Health = 100;
  player1X = player1RespawnX;
  player1Y = player1RespawnY;
  player2X = player2RespawnX;
  player2Y = player2RespawnY;
  player1SpeedX = 0;
  player1SpeedY = 0;
  player2SpeedX = 0;
  player2SpeedY = 0;
  bullets = [];
  gameOver = false;
  winner = "";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}