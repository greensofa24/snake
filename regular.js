const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

canvas.width = innerWidth * dpr;
canvas.height = innerHeight * dpr;

canvas.style.width = innerWidth + "px";
canvas.style.height = innerHeight + "px";

ctx.scale(dpr, dpr);

let width = 11;
let height = 11;

let tileSize = 20;
let delay = 150;

let originX = Math.round((innerWidth - width * tileSize) / 2);
let originY = Math.round((innerHeight - height * tileSize) / 2);

let snake = [{
    x: 0,
    y: 0
}];

let score = 0;

let apple = {};
newApple();

let direction = {
    x: 0,
    y: 0
};

let alive = true;

let lastTime = 0;
let accumulator = 0;

function gameLoop(timestamp) {
    if (!alive) return;

    if (!lastTime) {
        lastTime = timestamp;
    }

    accumulator += timestamp - lastTime;
    lastTime = timestamp;

    while (accumulator >= delay) {
        move();
        accumulator -= delay;
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function renderSnake() {
    ctx.fillStyle = "#00fe00";
    ctx.beginPath();

    for (let segment of snake) {
        ctx.rect(originX + segment.x * tileSize, originY + segment.y * tileSize, tileSize, tileSize);
    }

    ctx.fill();
}

function renderApple() {
    ctx.fillStyle = "#ff0000";

    ctx.fillRect(originX + apple.x * tileSize, originY + apple.y * tileSize, tileSize, tileSize);
}

function newApple() {
    do {
        apple = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        };
    } while (snake.some(segment => collisionCheck(segment, apple)));
}

function move() {
    if (direction.x == 0 && direction.y == 0) {
        return;
    }

    snake.pop();
    snake.unshift({ ...snake[0] });

    snake[0].x += direction.x;
    snake[0].y += direction.y;

    update();
}

function collisionCheck(tile1, tile2) {
    return tile1.y == tile2.y && tile1.x == tile2.x;
}

function die() {
    alive = false;
}

function update() {
    if (collisionCheck(snake[0], apple)) {
        score++;
        snake.push({});
        newApple();
    }

    for (let i = 1; i < snake.length; i++) {
        if (collisionCheck(snake[0], snake[i])) {
            return die();
        }
    }

    if (
        snake[0].x < 0 ||
        snake[0].x >= width ||
        snake[0].y < 0 ||
        snake[0].y >= height
    ) {
        return die();
    }

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Comic Sans MS";

    ctx.fillText("Score: " + score, 80, innerHeight / 2);

    ctx.strokeStyle = "#04d700";
    ctx.strokeRect(originX, originY, width * tileSize, height * tileSize);

    renderSnake();
    renderApple();
}

update();

addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            if (direction.y != 1) {
                direction = {
                    x: 0,
                    y: -1
                };
            }
            break;

        case "ArrowDown":
            if (direction.y != -1) {
                direction = {
                    x: 0,
                    y: 1
                };
            }
            break;

        case "ArrowLeft":
            if (direction.x != 1) {
                direction = {
                    x: -1,
                    y: 0
                };
            }
            break;

        case "ArrowRight":
            if (direction.x != -1) {
                direction = {
                    x: 1,
                    y: 0
                };
            }
            break;
    }
});
