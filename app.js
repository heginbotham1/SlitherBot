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

	this.botOn = true;
	this.currentDir = 0;
	this.hideAll = false;
	this.lastTurned = 0;
	this.currentFood;

	this.setDirection = function(deg) {
		if(deg > 240) deg = deg - 240;
		if(deg > 480) return; // too big!
		var h = new Uint8Array(1);
		h[0] = 1 == 1 ? deg : 254;
		ws.send(h);
		this.currentDir = deg;
	}

	this.setAcceleration = function(type) {
		var h = new Uint8Array(1);
		h[0] = 1 == type ? 253 : 254;
		ws.send(h);
	}

	this.bot = function() {
		this.log("Started the bot!");
		
		this.setDirection(this.currentDir);

		this.autoTasks();
	}

	this.turnAround = function() {
		this.setAcceleration(1);
		this.setDirection(Math.abs(this.currentDir - 123 - 10));
		this.setAcceleration(0);
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
				var tblocks = (Math.abs(mySnake.xx - snakeList[i].xx) + Math.abs(mySnake.yy - snakeList[i].yy)) / 2;
				if(tblocks < blocks || blocks == 0) {
					blocks = tblocks;
					sId = snakeList[i].id;
					x = snakeList[i].xx;
					y = snakeList[i].yy;
				}

				for(var j = 0; j < snakeList[i].pts.length; j++) {
					var tblocks = (Math.abs(mySnake.xx - snakeList[i].pts[j].xx) + Math.abs(mySnake.yy - snakeList[i].pts[j].yy)) / 2;
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
				//if(this.isSafeThere(c_food[i].xx, c_food[i].yy)) {
					var c_dist = (Math.abs(mySnake.xx - c_food[i].xx) + Math.abs(mySnake.yy - c_food[i].yy)) / 2;
					if(distance == 0 || c_dist < distance) {
						distance = c_dist;
						data = { xx: c_food[i].xx, yy: c_food[i].yy, id: c_food[i].id };
					}
				//}
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
		var latestSnakeTurnedOn = 0;

		var targetedFood = 0;
		var targetedFoodX = 0;
		var targetedFoodY = 0;

		this.log("Started autoBot!");
		function doBot() {
			parent.getNearestSnake(function(data) {
				if(data.blocksAway < (data.thickness + 210) && data.blocksAway != 0) { // ((((Date.now() / 1000) % 60) - parent.lastTurned) > 2 || data.snakeId != latestSnakeTurnedOn)) || data.blocksAway < (data.thickness + 45)
					/*latestSnakeTurnedOn = data.snakeId;
					parent.lastTurned = (Date.now() / 1000) % 60;
					parent.turnAround();*/
					var dX = Math.abs(data.xx - parent.mySnake.xx);
					var dY = Math.abs(data.yy - parent.mySnake.yy);

					var rad = Math.atan2(dY, dX);
					var deg = rad * (180 / Math.PI) + 180;
					while(deg > 360) deg = deg - 360;
					var slitherDeg = deg / 1.286;

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
							document.getElementsByClassName("nsi")[21].style.font = 'Arial';
							document.getElementsByClassName("nsi")[21].width = "250px";
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

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	}

	this.autoTasks = function() {
		var parent = this;
		setInterval(function() {
			if(parent.hideAll) parent.hideSnakes();
		}, 500);
	}

	this.hideSnakes = function() {
		this.snakes = snakes; // i want to keep 'em!
		snakes = [snake];
	}
}

var bot = new SlitherBot();

bot.iWantAll();

window.onmousemove = null;

document.onkeypress = function(e) {
	if(String.fromCharCode(e.which) == "t") {
		bot.turnAround();
	} else if(String.fromCharCode(e.which) == "b") {
		bot.bot();
	} else if(String.fromCharCode(e.which) == "s") {
		bot.autoBot();
	} else if(String.fromCharCode(e.which) == "h") {
		bot.hideAll = true;
	}
}
