// ==UserScript==
// @name         SlitherBot
// @namespace    SlitherBot
// @version      0.1-ALPHA1
// @author       j0ll3
// @match        http://slither.io/
// @grant        none
// ==/UserScript==

var version = "0.1-ALPHA1";

function SlitherBot() {
	this.name = "SlitherBot v" + version;

	this.botStatus = { autoBot: { on: false }, passiveBot: { on: false } };
	this.currentDir = 0;
	this.lastTurned = 0;
	this.currentFood;
	this.accelerating = false;

	this.setDirection = function(deg) {
		while(deg < 0) deg = deg + 240;
		while(deg > 240) deg = deg - 240;

		var h = new Uint8Array(1);
		h[0] = 1 == 1 ? deg : 254;
		ws.send(h);
		this.currentDir = deg;
	}

	this.setAcceleration = function(type) {
		var h = new Uint8Array(1);
		h[0] = 1 == type ? 253 : 254;
		ws.send(h);
		if(type == 1) {
			this.accelerating = true;
		} else {
			this.accelerating = false;
		}
	}

	this.bot = function() {
		this.log("Started the bot!");
		
		this.setDirection(this.currentDir);
	}

	this.turnAround = function() {
		this.setDirection(Math.abs(this.currentDir - 123 - 10));
	}

	this.snakeList = snakes;

	this.mySnake = snake;

	this.getNearestSnake = function(callback) {
		this.snakeList = snakes;
		this.mySnake = snake;

		snakeList = this.snakeList;
		mySnake = this.mySnake;

		var blocks = 0;
		var sId = 0;
		var x;
		var y;

		for(var i = 0; i < snakeList.length; i++) {
			if(snakeList[i].xx != mySnake.xx && snakeList[i].yy != mySnake.yy) {
				var tblocks = this.computeDistance(mySnake.xx, mySnake.yy, snakeList[i].xx, snakeList[i].yy);
				if(tblocks < blocks || blocks == 0) {
					blocks = tblocks;
					sId = snakeList[i].id;
					x = snakeList[i].xx;
					y = snakeList[i].yy;
				}

				for(var j = 0; j < snakeList[i].pts.length; j++) {
					var tblocks = this.computeDistance(mySnake.xx, mySnake.yy, snakeList[i].pts[j].xx, snakeList[i].pts[j].yy);
					if(tblocks < blocks) {
						blocks = tblocks;
						sId = snakeList[i].id;
						x = snakeList[i].pts[j].xx;
						y = snakeList[i].pts[j].yy;
					}
				}
			}
		}

		callback({ blocksAway: blocks, thickness: 0, snakeId: sId, xx: x, yy: y }); // todo
	}

	this.getNearestAndSafestFood = function(callback) {
		this.mySnake = snake;
		this.currentFood = foods;

		mySnake = this.mySnake;
		c_food = this.currentFood;

		var data = { xx: 0, yy: 0 };
		var distance = 0;

		for(var i = 0; i < c_food.length; i++) {
			if(c_food[i]) {
				var c_dist = this.computeDistance(mySnake.xx, mySnake.yy, c_food[i].xx, c_food[i].yy);
				if(distance == 0 || c_dist < distance) {
					distance = c_dist;
					data = { xx: c_food[i].xx, yy: c_food[i].yy, id: c_food[i].id };
				}
			}
		}
		callback(data);
	}

	this.isSafeThere = function(xx, yy) {
		this.snakeList = snakes;
		snakeList = this.snakeList;

		for(var i = 0; i < snakeList.length; i++) {
			if(Math.abs(xx - snakeList[i].xx) > 30 || Math.abs(yy - snakeList[i].yy) > 30) return false;
		}

		return true;
	}

	this.iWantAll = function() {
		localStorage.edttsg = 1;
		document.getElementById("fbh").style.display = "none";
		document.getElementById("twth").style.display = "none";
		document.getElementById("grqh").style.display = "none";
		document.getElementById("clq").style.display = "none";
		document.getElementById("tips").style.display = "none";
		document.getElementById("logo").style.display = "none";
		document.getElementsByTagName("iframe")[0].style.display = "none";
		setInterval(function() {
			document.getElementById("login").style.transform = "scale(1, 1)";
		}, 1000);
		window.oncontextmenu = function() {
			return true;
		};
	}

	this.getNextDirection = function() {

	}

	this.foodExists = function(id) {
		foodList = foods;

		for(var i = 0; i < foodList.length; i++) {
			if(foodList[i]) {
				if(foodList[i].id == id) {
					return true;
				}
			}
		}

		return false;
	}
 
	this.autoBot = function() {
		var parent = this;

		var targetedFood = 0;
		var targetedFoodX = 0;
		var targetedFoodY = 0;

		this.log("Started autoBot!");
		function doBot() {
			parent.getNearestSnake(function(data) {
				if(data.blocksAway < (data.thickness + 300) && data.blocksAway != 0) {
					parent.turnAround(); // precaution, it will turn the right way after the compution
					var dX = Math.abs(data.xx - parent.mySnake.xx);
					var dY = Math.abs(data.yy - parent.mySnake.yy);

					var rad = Math.atan2(dY, dX);
					var deg = rad * (180 / Math.PI) + 180;
					while(deg > 360) deg = deg - 360;
					var slitherDeg = Math.round(deg / 1.286);

					if(slitherDeg > 0) {
						parent.setDirection(slitherDeg);
					}

					if(data.blocksAway < (data.thickness + 100) && !this.accelerating) {
						parent.setAcceleration(1);
						setTimeout(function() {
							parent.setAcceleration(0);
						}, 180);
					}

					parent.setDirection(slitherDeg);

					document.getElementsByClassName("nsi")[19].innerHTML = 'Nearest snake: ' + Math.round(data.blocksAway / 20) + " blocks away<br />Setting deg to: " + slitherDeg;
				} else {
					parent.getNearestAndSafestFood(function(data) {
						if(targetedFood != 0 && foodExists(targetedFood)) {
							data.xx = targetedFoodX;
							data.yy = targetedFoodY;
						}

						if(data.xx != 0 && data.yy != 0) {
							var dX = Math.abs(data.xx - parent.mySnake.xx);
							var dY = Math.abs(data.yy - parent.mySnake.yy);

							targetedFoodX = data.xx;
							targetedFoodY = data.yy;

							var rad = Math.atan2(dY, dX);
							var deg = rad * (180 / Math.PI);
							var slitherDeg = deg / 1.286; // degrees / 1.286 is the conversion to "SlitherDeg"

							document.getElementsByClassName("nsi")[21].style.color = '#fff';
							document.getElementsByClassName("nsi")[21].style.fontFamily = 'Arial';
							document.getElementsByClassName("nsi")[21].style.width = "250px";
							document.getElementsByClassName("nsi")[21].innerHTML = "Nearest food: " + data.xx + ", " + data.yy + "<br />Setting deg to: " + slitherDeg;

							parent.setDirection(slitherDeg);
						}
					});
				}
				setTimeout(function(){doBot();}, 80);
			});
		}
		doBot();
	}

	this.passiveBot = function() {
		var parent = this;

		var targetedFood = 0;
		var targetedFoodX = 0;
		var targetedFoodY = 0;

		this.log("Started passiveBot!");
		function doBot() {
			parent.getNearestSnake(function(data) {
				if(data.blocksAway < (data.thickness + 300) && data.blocksAway != 0) {
					parent.turnAround(); // precaution, it will turn the right way after the compution
					var dX = Math.abs(data.xx - parent.mySnake.xx);
					var dY = Math.abs(data.yy - parent.mySnake.yy);

					var rad = Math.atan2(dY, dX);
					var deg = rad * (180 / Math.PI) + 180;
					while(deg > 360) deg = deg - 360;
					var slitherDeg = Math.round(deg / 1.286);

					if(slitherDeg > 0) {
						parent.setDirection(slitherDeg);
					}

					document.getElementsByClassName("nsi")[19].innerHTML = 'Nearest snake: ' + Math.round(data.blocksAway / 20) + " blocks away<br />Setting deg to: " + slitherDeg;
				}
				setTimeout(function(){doBot();}, 80);
			});
		}
		doBot();
	}

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	}

	this.computeDistance = function(x1, y1, x2, y2, s1, s2) { // x:1, y:1, x:2, y:2, size:1, size:2
        s1 = s1 || 0;
        s2 = s2 || 0;
        var xD = x1 - x2;
        var yD = y1 - y2;
        return Math.sqrt(xD * xD + yD * yD) - (s1 + s2);
    };
}

var bot = new SlitherBot();

bot.iWantAll();

window.onmousemove = null;

document.onkeypress = function(e) {
	if(String.fromCharCode(e.which) == "b") {
		bot.bot();
	} else if(String.fromCharCode(e.which) == "a") {
		if(!bot.botStatus.passiveBot.on) {
			bot.autoBot();
			bot.botStatus.autoBot.on = true;
		} else {
			alert('Another bot is already running.');
		}
	} else if(String.fromCharCode(e.which) == "p") {
		if(!bot.botStatus.autoBot.on) {
			bot.passiveBot();
			bot.botStatus.passiveBot.on = true;
		} else {
			alert('Another bot is already running.');
		}
	}
}
