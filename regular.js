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

let queue = [];

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
        ctx.rect(originX + (segment.x + (width - 1) / 2) * tileSize, originY + (segment.y + (height - 1) / 2) * tileSize, tileSize, tileSize);
    }

    ctx.fill();
}

function renderApple() {
    ctx.fillStyle = "#ff0000";

    ctx.fillRect(originX + (apple.x + (width - 1) / 2) * tileSize, originY + (apple.y + (height - 1) / 2) * tileSize, tileSize, tileSize);
}

function newApple() {
    do {
        apple = {
            x: Math.floor(Math.random() * width) - (width - 1) / 2,
            y: Math.floor(Math.random() * height) - (height - 1) / 2
        };
    } while (snake.some(segment => collisionCheck(segment, apple)));
}

function move() {
    if (queue.length) {
        direction = queue.shift();
    }

    if (direction.x == 0 && direction.y == 0) {
        return;
    }

    if (snake.length >= 2) {
        snake.pop();
        snake.unshift({ ...snake[0] });
    }

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
        Math.abs(snake[0].x) >= (width + 1) / 2 ||
        Math.abs(snake[0].y) >= (height + 1) / 2
    ) {
        return die();
    }

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Comic Sans MS";

    ctx.fillText("Score: " + score, 80, innerHeight / 2);

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#04d700";
    ctx.strokeRect(
        originX - 2.5,
        originY - 2.5,
        width * tileSize + 5,
        height * tileSize + 5
    );

    renderSnake();
    renderApple();
}

update();

function equivalent(obj1, obj2) {
    return obj1.x == obj2.x && obj1.y == obj2.y;
}

addEventListener("keydown", (event) => {
    let lastDirection = queue.length ? queue[queue.length - 1] : direction;

    if (event.key == "ArrowUp" && lastDirection.y != 1) {
        queue.push({ x: 0, y: -1 });
    } else if (event.key == "ArrowDown" && lastDirection.y != -1) {
        queue.push({ x: 0, y: 1 });
    } else if (event.key == "ArrowLeft" && lastDirection.x != 1) {
        queue.push({ x: -1, y: 0 });
    } else if (event.key == "ArrowRight" && lastDirection.x != -1) {
        queue.push({ x: 1, y: 0 });
    }
});
