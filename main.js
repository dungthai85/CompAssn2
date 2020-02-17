
// GameBoard code below

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.current = game;
    this.colors = ["cyan", "Red", "violet", "Blue", "White", "Pink", "Orange"];
    this.color = Math.floor(Math.random() *10 + 1);
    this.tag = "none";
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

//Checks if colliding on the right wall
Circle.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
//Checks if colliding on the left wall
Circle.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
//Checks if colliding on the bottom wall
Circle.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
//Checks if colliding on the top wall
Circle.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};
//Check if the two objects are colliding by checking if their distance is less than the two radius
Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    //Moves the circles
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    //If it collides with sides flip the x velocity
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
    }
    //If it collides with sides flip the y velocity
    if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y;
    }
    //Checks if the mouse pointer is touching the circles.
    if ((this.x + this.radius > this.game.mouse.x - 200 && this.x + this.radius < this.game.mouse.x + 200) 
        && (this.y + this.radius > this.game.mouse.y - 200 && this.y + this.radius < this.game.mouse.y + 200)){
            var dist = distance(this, this.game.mouse);
            var difX = (this.game.mouse.x - this.x) / dist;
            var difY = (this.game.mouse.y - this.y) / dist;
            this.velocity.x += difX / (dist * dist) * acceleration;
            this.velocity.y += difY / (dist * dist) * acceleration;

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            }
        }
    //Loop to go through every entity to check for collision with other circles.
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {
            var temp = this.velocity;
            this.velocity = ent.velocity;
            ent.velocity = temp;
            //If the circle is not the red circle
            if(this.tag !== "red"){
                //If it is colliding with the red circle, change color to violet
                if (ent.tag === "red"){
                    this.color = 2;
                }
                //If it collides with the still circles, change the color back to violet
                else if (ent.tag === "white"){
                    this.color = 4;
                }
                //If it collides with a circle that touched red, change it to violet
                //Sometimes this collision will cause a new circle to emerge.
                else if (ent.tag === "none" && ent.color == 2) {
                    this.color = 2;    
                    var number = Math.floor(Math.random() * 10 + 1);
                    //dconsole.log(number);
                    if (number % 4 === 0){
                        this.speed = 2;
                        if (this.game.entities.length < 35){
                            const emerge = new Circle(this.current);
                            emerge.color = 4;
                            this.current.addEntity(emerge);
                        }
                    }
                }
            }
            // if(this.tag === "red"){
            //     if(ent.tag === "white"){
            //         ent.removeFromWorld = true;
            //     }
            // }
            //If the Still circles have been touched a certain number it will remove and add a new entity
            if (ent.count === 0 && this.game.entities.length < 45){
                circle = new StillCircle(this.current);
                circle.speed = 0;
                circle.radius = Math.floor(Math.random() * 10 + 10);
                // circle.color = Math.floor(Math.random() *4 + 1);
                circle.color = 0;
                this.game.addEntity(circle);
                ent.removeFromWorld = true;
            }
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent) {
                var dist = distance(this, ent);
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;

            this.velocity.x += difX / (dist * dist) * acceleration;
            this.velocity.y += difY / (dist * dist) * acceleration;

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            };
        };
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

}

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

function StillCircle(game) {
    this.player = 1;
    this.radius = 20;
    this.colors = ["cyan", "Red", "violet", "Blue", "White", "Pink", "Orange"];
    this.color = Math.floor(Math.random() *10 + 1);
    this.tag = "white";
    this.count = 50;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

StillCircle.prototype = new Entity();
StillCircle.prototype.constructor = StillCircle;

StillCircle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

StillCircle.prototype.update = function () {
    Entity.prototype.update.call(this);

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {
            // console.log(this.count);
            if(ent.tag === "none" && this.count > 0){
                this.count -= 1;
            } 
        };
    };
}

StillCircle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

var friction = 1;
var acceleration = 5000;
var maxSpeed = 700;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.color = 1;
    circle.tag = "red";
    gameEngine.addEntity(circle);

    for (var i = 0; i < 10; i++) {
        circle = new Circle(gameEngine);
        circle.color = 4;
        gameEngine.addEntity(circle);
    };
    for (var i = 0; i < 5; i++) {
        circle = new StillCircle(gameEngine);
        circle.speed = 0;
        circle.radius = Math.floor(Math.random() * 10 + 10);
        // circle.color = Math.floor(Math.random() *4 + 1);
        circle.color = 0;
        gameEngine.addEntity(circle);
    };

    gameEngine.init(ctx);
    gameEngine.start();
});
