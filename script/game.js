class Game {
    constructor() {
        this.score = 0;
        this.items = [];
        this.ship = new Ship(200, 800, 5, 100, "white");
        this.spawner = new Ball(undefined, undefined, 100, undefined, 0, 0, "planet");
        this.balls = [];
        this.ammos = [];
        this.spammos = [];
        this.explosive = [];
    }

    itemState() {
        for (const item of this.items) {
            item.toBall(this.items);
            item.toObj(this.spawner);
            item.toEdge();
            if (item.toObj(this.ship)) {
                if (item.imgId === "item4") {
                    this.score += 30;
                }
                item.doFunc(this.ship);
                item.remove(this.items);
            }
            item.makeAMove();
            drawImgInBall(item);
        }
    };

    specialAmmoState() {
        for (const ammo of this.spammos) {
            if (ammo.toObj(this.ship) && ammo.imgId === "ammo1") {
                this.ship.health -= ammo.damage;
            }
            if (ammo.imgId === "ammo3") {
                for (const ball of this.balls) {
                    ball.makeExplosive(this.explosive)
                }
                for (const ammo of this.ammos) {
                    this.explosive.push(new ExplosiveBall(ammo.x, ammo.y, ammo.radius / 2, "explosive5", 0.3));
                }
                this.balls = [];
                this.ammos = [];
                this.spammos = [];
            }
            if (ammo.imgId === "ammo2") {
                ammo.toEdge();
                ammo.toObj(this.spawner);
                if (ammo.toObj(this.ship)) {
                    this.ship.health += 3;
                }
            }
            ammo.makeAMove();
            drawImgInBall(ammo);

        }
    };

    ammoState() {
        for (const ammo of this.ammos) {
            ammo.toEdge();
            ammo.toObj(this.spawner);
            if (ammo.toObj(this.ship)) {
                this.ship.health -= ammo.damage;
            }
            if (ammo.toArrOfObj(this.balls) >= 0) {
                const exBall = this.balls[ammo.toArrOfObj(this.balls)];
                if (radNum(1, 0)) {
                    if (exBall.radius / 2 > 10) {
                        exBall.explore(this.balls, 2);
                        exBall.makeExplosive(this.explosive);
                        ammo.remove(this.ammos);
                        this.score += 5;
                    } else {
                        this.spawnItemFrom(exBall);
                    }
                } else {
                    ammo.toBall(this.balls);
                }
            }
            ammo.makeAMove();
        }
    };

    ballState() {
        for (const ball of this.balls) {
            ball.toEdge();
            ball.toObj(this.spawner);
            if (ball.toObj(this.ship)) {
                ball.explore(this.balls, 2);
                this.ship.health -= ball.damage;
                this.score -= 10;
                ball.makeExplosive(this.explosive);
            }
            if (ball.toArrOfObj(this.ammos) >= 0) {
                if (radNum(1, 0)) {
                    this.ammos[ball.toArrOfObj(this.ammos)].remove(this.ammos);
                    ball.makeExplosive(this.explosive);
                    if (ball.radius / 2 > 10) {
                        ball.explore(this.balls, 2);
                        this.score += 5;
                    } else {
                        this.spawnItemFrom(ball);
                    }
                } else {
                    ball.toBall(this.ammos);
                }
            }
            if (ball.toArrOfObj(this.spammos) >= 0) {
                if (radNum(1, 0)) {
                    ball.remove(this.balls);
                } else {
                    if (ball.radius / 2 > 15)
                        ball.explore(this.balls, 2);
                    else
                        ball.remove(this.balls);
                }
                ball.makeExplosive(this.explosive);
                this.score += 5;
            }
            ball.toBall(this.balls);
            ball.makeAMove();
        }
    };

    spawnItemFrom(ball) {
        if (!radNum(4, 0)) {
            this.items.push(new Item(ball.x, ball.y));
        }
        if (!radNum(5, 0)) {
            this.items.push(new Item(ball.x, ball.y, "item1"));
        }
        if (!radNum(20, 0)) {
            this.items.push(new Item(ball.x, ball.y, "item2"));
        }
        if (!radNum(25, 0)) {
            this.items.push(new Item(ball.x, ball.y, "item3"));
        }
        if (!radNum(3, 0)) {
            this.items.push(new Item(ball.x, ball.y, "item4"));
        }
        ball.remove(this.balls);
        ball.makeExplosive(this.explosive, 0.3);
        this.score += 5;
    }

    drawBall() {
        for (const ball of this.balls) {
            drawImgInBall(ball)
        }
    };

    drawAmmo() {
        for (const ammo of this.ammos) {
            drawImgInBall(ammo, true)
        }
    };

    shipState() {
        if (this.ship.health <= 0) {
            canvasClean();
            drawBackGround();
            setTimeout(() => {
                if (confirm("play again?")) {
                    window.location.reload();
                }
            }, 1000)

        }
        this.ship.toObj(this.spawner);
        this.ship.toEdge();
        this.ship.makeAMove();
    };

    displayScore(x, y, string = "") {
        ctx.font = "25px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(string, x, y - 30);
        ctx.fillText("Health " + Math.floor(this.ship.health), x, y);
        ctx.fillText("Items: " + this.ship.totalAmmo.length, x, y + 30);
        ctx.fillText("Score " + this.score, x, y + 80);
    };

    drawExplosion() {
        for (const e of this.explosive) {
            e.drawExplosive(this.explosive);
        }
    };

    combineState() {
        this.specialAmmoState();
        this.ammoState();
        this.ballState();
        this.shipState();
        this.itemState();
    }
}

const game = new Game();
let n = 0;
rockGenerator(7);
ammoGenerator(3);
itemsGenerator(4);
explosiveGenerator(5);

setupScore();
setupGamePlay();
makeGameHarder();
spawnBalls();

function setupGamePlay() {
    canvasClean();
    drawBackGround();
    game.combineState();
    game.drawExplosion();
    game.drawAmmo();
    game.drawBall();
    drawImgInBall(game.spawner, true);
    drawImgInBall(game.ship, true);
    game.displayScore(15, 60, "stage: " + n);
    if (game.ship.health > 0) {
        setTimeout(setupGamePlay, 20);
    } else {
        drawImgInBall(game.ship, false, "explosive1")
    }
}

function makeGameHarder() {
    n++;
    setTimeout(makeGameHarder, 90000)
}

function spawnBalls() {
    game.spawner.spawn(game.balls, n);
    game.spawner.color = rainbow(Math.random());
    setTimeout(spawnBalls, 15000);
}

function setupScore() {
    game.score += n + Math.floor((game.balls.length + game.ammos.length) / 10);
    setTimeout(setupScore, 5000);
}

window.addEventListener("keydown", evt => {
    switch (evt.key) {
        case "ArrowRight":
            game.ship.moveRight();
            break;
        case "ArrowLeft":
            game.ship.moveLeft();
            break;
        case"ArrowUp":
            game.ship.moveUp();
            break;
        case "ArrowDown":
            game.ship.moveDown();
            break;
        case "a":
            if (game.ship.totalAmmo.length > 0) {
                const ammo = game.ship.totalAmmo.pop();
                game.ship.shoot(game.spammos, this.angle, ammo.imgId, 10);
            }
            break;
        case "s":
            game.ship.shoot(game.ammos, this.angle, "ammo0");
            break;
    }
});
