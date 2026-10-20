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

let boxStrokeWidth = 5;
let tileSize = 20;
let delay = 150;

let originX = Math.round((innerWidth - width * tileSize) / 2);
let originY = Math.round((innerHeight - height * tileSize) / 2);

let centerOffsetX = (width - 1) / 2;
let centerOffsetY = (height - 1) / 2;

let boxWidth = width * tileSize;
let boxHeight = height * tileSize;

let geometry = "square";

let boardRotation = 0;
let extraRotation = 0;

let keybinds = [
    {
        x: 0,
        y: -1
    },
    {
        x: 1,
        y: 0
    },
    {
        x: 0,
        y: 1
    },
    {
        x: -1,
        y: 0
    }
]

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

function rotateDirection(x, y, degrees) {
    const rad = -degrees * Math.PI / 180;

    const rx = x * Math.cos(rad) - y * Math.sin(rad);
    const ry = x * Math.sin(rad) + y * Math.cos(rad);

    return {
        x: Math.round(rx),
        y: Math.round(ry),
    };
}

function renderSnake() {
    ctx.fillStyle = "#00fe00";
    ctx.beginPath();

    for (let segment of snake) {
        ctx.rect(originX + (segment.x + centerOffsetX) * tileSize, originY + (segment.y + centerOffsetY) * tileSize, tileSize, tileSize);
    }

    ctx.fill();
}

function renderApple() {
    switch (apple.type.segMod) {
        case 2:
            ctx.fillStyle = "#ff8000";
            break;
        case -1:
            ctx.fillStyle = "#00ffff";
            break;
        case -2:
            ctx.fillStyle = "#0000ff";
            break;
        case 0:
            ctx.fillStyle = "#bfbfbf";
            break;
        default:
            ctx.fillStyle = "#ff0000";
    }

    let x = originX + (apple.x + centerOffsetX) * tileSize;
    let y = originY + (apple.y + centerOffsetY) * tileSize;

    if (apple.type.speedMod) {
        switch (apple.type.speedMod) {
            case 1:
                ctx.beginPath();

                ctx.moveTo(x + tileSize / 2, y);
                ctx.lineTo(x, y + tileSize);
                ctx.lineTo(x + tileSize, y + tileSize);

                ctx.closePath();
                ctx.fill();

                break;

            case -1:
                ctx.beginPath();

                ctx.moveTo(x + tileSize / 2, y + tileSize);
                ctx.lineTo(x, y);
                ctx.lineTo(x + tileSize, y);

                ctx.closePath();
                ctx.fill();

                break;

            case 2:
                ctx.beginPath();

                ctx.moveTo(x + tileSize / 2, y);
                ctx.lineTo(x + tileSize / 5, y + tileSize);
                ctx.lineTo(x + tileSize * 4 / 5, y + tileSize);

                ctx.closePath();
                ctx.fill();

                break;

            case -2:
                ctx.beginPath();

                ctx.moveTo(x + tileSize / 2, y + tileSize);
                ctx.lineTo(x + tileSize / 5, y);
                ctx.lineTo(x + tileSize * 4 / 5, y);

                ctx.closePath();
                ctx.fill();

                break;
        }

        return;
    }

    if (apple.type.gridMod) {
        switch (apple.type.gridMod) {
            case 1:
                ctx.beginPath();

                ctx.moveTo(x + tileSize / 2, y);
                ctx.lineTo(x, y + tileSize / 2);
                ctx.lineTo(x + tileSize / 2, y + tileSize);
                ctx.lineTo(x + tileSize, y + tileSize / 2);

                ctx.closePath();
                ctx.fill();

                break;

            case -1:
                ctx.fillRect(x + tileSize / 4, y + tileSize / 4, tileSize / 2, tileSize / 2);

                break;
        }

        return;
    }

    ctx.fillRect(x, y, tileSize, tileSize);
}

function getAppleType() {
    switch (score + 1) {
        case 4:
        case 8:
        case 14:
            return {
                segMod: -1,
                speedMod: 1
            };

        case 6:
        case 9:
            return {
                gridMod: 1
            };

        case 11:
            return {
                segMod: -1,
                speedMod: -1
            };

        case 13:
            return {
                segMod: 2,
                gridMod: 1
            };

        case 15:
            return {
                gridMod: 1
            };

        case 17:
        case 18:
            return {
                segMod: 2,
                speedMod: -1
            };

        case 19:
        case 20:
        case 21:
            return {
                segMod: -2,
                gridMod: -1
            };

        case 22:
            return {
                segMod: 0,
                speedMod: -2
            }

        case 24:
        case 26:
            return {
                segMod: -1,
                gridMod: -1
            }

        case 25:
        case 28:
            return {
                segMod: 0,
                gridMod: -1
            }

        case 27:
        case 29:
            return {
                segMod: -2,
                speedMod: -2
            }

        case 30:
            return {
                segMod: -1,
            }

        case 31:
            return {
                segMod: -1,
                speedMod: -1
            }

        case 32:
        case 33:
        case 34:
            return {
                segMod: 0
            }

        case 35:
        case 36:
        case 37:
        case 38:
            return {
                gridMod: 1
            }

        case 39:
        case 40:
        case 41:
            return {
                speedMod: 2
            }

        case 42:
        case 43:
        case 44:
            return {
                rotateMod: 5
            }

        case 45:
        case 46:
            return {
                rotateMod: 20
            }

        case 49:
        case 50:
        case 51:
            return {
                segMod: -2,
                rotateMod: -18
            }

        case 51:
            return {
                segMod: -1,
                rotateMod: -3
            }

        case 52:
        case 59:
        case 62:
            return {
                newGeometry: "diamond"
            }

        case 56:
        case 61:
        case 63:
            return {
                newGeometry: "square"
            }

        default:
            return {};
    }
}

function eatApple(type) {
    type.segMod ??= 1;

    if (type.segMod < 0) {
        for (let i = 0; i < -type.segMod; i++) {
            snake.pop();
        }
    } else {
        for (let i = 0; i < type.segMod; i++) {
            snake.push({});
        }
    }

    if (type.speedMod) {
        if (type.speedMod < 0) {
            for (let i = 0; i < -type.speedMod; i++) {
                delay *= 1.1;
            }
        } else {
            for (let i = 0; i < type.speedMod; i++) {
                delay /= 1.1;
            }
        }
    }

    if (type.gridMod) {
        width += type.gridMod * 2;
        height += type.gridMod * 2;

        originX = Math.round((innerWidth - width * tileSize) / 2);
        originY = Math.round((innerHeight - height * tileSize) / 2);

        centerOffsetX = (width - 1) / 2;
        centerOffsetY = (height - 1) / 2;

        boxWidth = width * tileSize;
        boxHeight = height * tileSize;
    }

    if (type.newGeometry) {
        for (let i = 0; i < snake.length; i++) {
            snake[i] = {};
        };
        snake[0] = {
            x: 0,
            y: 0
        };

        direction = {
            x: 0,
            y: 0
        };
        queue = [];

        switch (type.newGeometry) {
            case "square":
                geometry = "square";
                extraRotation = 0;

                keybinds[0] = {
                    x: 0,
                    y: -1
                };
                keybinds[1] = {
                    x: 1,
                    y: 0
                };
                keybinds[2] = {
                    x: 0,
                    y: 1
                };
                keybinds[3] = {
                    x: -1,
                    y: 0
                };

                break;

            case "diamond":
                geometry = "diamond";
                extraRotation = 45;

                keybinds[0] = {
                    x: -1,
                    y: -1
                };
                keybinds[1] = {
                    x: 1,
                    y: -1
                };
                keybinds[2] = {
                    x: 1,
                    y: 1
                };
                keybinds[3] = {
                    x: -1,
                    y: 1
                };

                break;
        }
    }

    if (type.rotateMod) {
        boardRotation += type.rotateMod;
    }
}

function newApple() {
    let g = getAppleType().gridMod;
    let w = width - (g < 0 ? g * -2 : 0);
    let h = height - (g < 0 ? g * -2 : 0);

    function getPos() {
        return {
            x: Math.floor(Math.random() * w) - (w - 1) / 2,
            y: Math.floor(Math.random() * h) - (h - 1) / 2
        };
    }

    let pos;

    do {
        pos = getPos();
    } while (snake.some(segment => collisionCheck(segment, pos)) || (geometry == "diamond" && ((pos.x & 1) != (pos.y & 1))));

    apple = pos;
    apple.type = getAppleType();
}

function move() {
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
    console.log("die")
    alive = false;
}

function update() {
    if (queue.length) {
        direction = queue.shift();
    }

    if (collisionCheck(snake[0], apple)) {
        score++;
        eatApple(apple.type);
        newApple();
    }

    for (let i = 1; i < snake.length; i++) {
        if (collisionCheck(snake[0], snake[i])) {
            return die();
        }
    }

    if (Math.abs(snake[0].x) == (width + 1) / 2 || Math.abs(snake[0].y) == (height + 1) / 2) {
        return die();
    }

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Comic Sans MS";

    ctx.fillText("Score: " + score, 80, innerHeight / 2);

    ctx.save();

    ctx.translate(innerWidth / 2, innerHeight / 2);
    ctx.rotate((boardRotation + extraRotation) * Math.PI / 180);
    ctx.translate(-innerWidth / 2, -innerHeight / 2);

    ctx.lineWidth = boxStrokeWidth;
    ctx.strokeStyle = "#04d700";

    ctx.strokeRect(originX - boxStrokeWidth / 2, originY - boxStrokeWidth / 2, boxWidth + boxStrokeWidth, boxHeight + boxStrokeWidth);

    renderSnake();
    renderApple();

    ctx.restore();
}

update();

function equivalent(obj1, obj2) {
    return Object.keys(obj1).length == Object.keys(obj2).length && Object.keys(obj1).every(key => obj1[key] == obj2[key]);
}

addEventListener("keydown", (event) => {
    let lastDirection = queue.length ? queue[queue.length - 1] : direction;

    function mapCoordinates(x, y) {
        if (x == 0 && y == -1) return 0;
        if (x == 1 && y == 0)  return 1;
        if (x == 0 && y == 1)  return 2;
        if (x == -1 && y == 0) return 3;
        return -1;
    }

    switch (event.key) {
        case "ArrowUp":
            queue.push(keybinds[(queue.length > 0 ? queue.at(-1) : mapCoordinates(direction.x, direction.y) + 1) % 4]);
            break;
        case "ArrowDown":
            queue.push(keybinds[(queue.length > 0 ? queue.at(-1) : mapCoordinates(direction.x, direction.y) + 3) % 4]);
            break;
    }

    if (direction.x == 0 && direction.y == 0) {
        direction = queue.shift();
    }
});
