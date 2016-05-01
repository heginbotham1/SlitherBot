// ==UserScript==
// @name         SlitherBot
// @namespace    SlitherBot
// @version      0.1-PRE-BETA
// @author       j0ll3
// @match        http://slither.io/
// @grant        none
// ==/UserScript==

var version = "0.1-PRE-BETA";

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

function SlitherBot() {
	this.name = "SlitherBot v" + version;

	this.botStatus = { autoBot: { on: false }, passiveBot: { on: false } };
	this.currentDir = 0;
	this.lastTurned = 0;
	this.currentFood;
	this.accelerating = false;
	this.foodBL = [];

	this.setDirection = function(deg) {
		while(deg < 0) deg = deg + 240;
		while(deg > 240) deg = deg - 240;

		var h = new Uint8Array(1);
		h[0] = 1 == 1 ? deg : 254;
		ws.send(h);
		this.currentDir = deg;
	};

	this.setAcceleration = function(type) {
		var h = new Uint8Array(1);
		h[0] = 1 == type ? 253 : 254;
		ws.send(h);
		if(type == 1) {
			this.accelerating = true;
		} else {
			this.accelerating = false;
		}
	};

	this.bot = function() {
		this.log("Started the bot!");
		
		this.setDirection(this.currentDir);
	};

	this.turnAround = function() {
		this.setDirection(Math.abs(this.currentDir - 123 - 10));
	};

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
			if(!snakeList[i].hasOwnProperty("dead")) {
				if(!snakeList[i].dead) {
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
			}
		}

		callback({ blocksAway: blocks, thickness: 0, snakeId: sId, xx: x, yy: y }); // todo
	};

	this.getNearestAndSafestFood = function(callback) {
		this.mySnake = snake;
		this.currentFood = foods;

		mySnake = this.mySnake;
		c_food = this.currentFood;

		var data = { xx: 0, yy: 0 };
		var distance = 0;
		var size = 0;

		for(var i = 0; i < c_food.length; i++) {
			if(c_food[i]) {
				if(c_food[i].eaten_fr == 0) {
					if(!this.isBlacklistedFood(c_food[i].id)) {
						if(this.isSafeThere(c_food[i].xx, c_food[i].yy)) {
							var c_dist = this.computeDistance(mySnake.xx, mySnake.yy, c_food[i].xx, c_food[i].yy);
							if(distance == 0 || c_dist < distance || Math.abs(c_food[i].gr - size) > 2) {
								distance = c_dist;
								data = { xx: c_food[i].xx, yy: c_food[i].yy, id: c_food[i].id, raw_data: c_food[i] };
							}
						}
					}
				}
			}
		}
		callback(data);
	};

	this.isSafeThere = function(xx, yy) {
		this.snakeList = snakes;
		snakeList = this.snakeList;

		for(var i = 0; i < snakeList.length; i++) {
			if(this.computeDistance(xx, yy, snakeList[i].xx, snakeList[i].yy) > 100 && this.mySnake.id != snakeList[i].id) return false;
		}

		return true;
	};

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
	};

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
	};

	this.getSnake = function(sid) {
		var snake_l = this.snakeList;

		for(var i = 0; i < snake_l.length; i++) if(snake_l[i].id == sid) return snake_l[i];
		return false;
	};

	this.addToFoodBL = function(fid) {
		this.foodBL.push(fid);
	};

	this.foodTimeout = function(fid) {
		setTimeout(function() {
			this.foodBL.splice(this.foodBL.indexOf(fid), 1);
		}, 4000);
	};

	this.isBlacklistedFood = function(fid) {
		if(this.foodBL.indexOf(fid) > -1) {
			return true;
		} else {
			return false;
		}
	};
 
	this.autoBot = function() {
		var parent = this;

		var targetedFood = 0;
		var targetedFoodX = 0;
		var targetedFoodY = 0;
		var foodTries = 0;

		var div = document.createElement('div');
		div.style.width = "20px";
		div.style.height = "20px";
		div.style.background = "#ff0000";
		div.style.position = "absolute";
		div.style.zIndex = "99999";
		div.style.borderRadius = "20px";
		div.innerHTML = "E";
		div.style.color = '#fff';
		div.style.lineHeight = "20px";
		div.style.fontFamily = "Arial";
		div.style.textAlign = "center";
		div.setAttribute("id", "target-div");
		document.body.appendChild(div);

		this.currentTarget = document.getElementById("target-div");

		var div = document.createElement('div');
		div.style.width = "20px";
		div.style.height = "20px";
		div.style.background = "limegreen";
		div.style.position = "absolute";
		div.style.zIndex = "99999";
		div.style.borderRadius = "20px";
		div.innerHTML = "F";
		div.style.color = '#fff';
		div.style.lineHeight = "20px";
		div.style.fontFamily = "Arial";
		div.style.textAlign = "center";
		div.setAttribute("id", "food-div");
		document.body.appendChild(div);

		this.foodDiv = document.getElementById("food-div");

		this.log("Started autoBot!");

		function doBot() {
			parent.getNearestSnake(function(data) {
				parent.currentTarget.style.display = 'none';
				parent.foodDiv.style.display = 'none';
				document.getElementsByClassName("custom-snake-dots").remove();
				if(data.blocksAway < (data.thickness + 140) && data.blocksAway != 0) {
					parent.currentTarget.style.display = 'block';
					parent.turnAround(); // precaution, it will turn the right way after the compution
					var dX = data.xx - parent.mySnake.xx;
					var dY = data.yy - parent.mySnake.yy;

					var deg = Math.atan2(parent.mySnake.yy - data.yy, parent.mySnake.xx - data.xx) * 180 / Math.PI;
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

					parent.currentTarget.style.top = dY + (document.height) / 2;
					parent.currentTarget.style.left = dX + (document.width) / 2;

					var snakeData = parent.getSnake(data.snakeId);

					document.getElementsByClassName("nsi")[19].innerHTML = 'Nearest snake: ' + Math.round(data.blocksAway / 20) + " blocks away<br />Setting deg to: " + slitherDeg;
				} else {
					if(Math.random() > 0.95) {
						parent.setDirection(Math.floor(Math.random() * 360) + 1);
					} else {
						parent.foodDiv.style.display = 'block';
						parent.getNearestAndSafestFood(function(data) {
							if(targetedFood != 0 && parent.foodExists(data.id)) {
								data.xx = targetedFoodX;
								data.yy = targetedFoodY;
							}

							if(data.xx != 0 && data.yy != 0) {
								var dX = data.xx - parent.mySnake.xx;
								var dY = data.yy - parent.mySnake.yy;

								targetedFoodX = data.xx;
								targetedFoodY = data.yy;

								var deg = (Math.atan2(parent.mySnake.yy - data.yy, parent.mySnake.xx - data.xx) * 180 / Math.PI) + 180;
								while(deg > 360) deg = deg - 360;
								var slitherDeg = deg / 1.3; // degrees / 1.286 is the conversion to "SlitherDeg"

								if(Math.abs(slitherDeg - parent.currentDir) <= 160) {
									document.getElementsByClassName("nsi")[21].style.color = '#fff';
									document.getElementsByClassName("nsi")[21].style.fontFamily = 'Arial';
									document.getElementsByClassName("nsi")[21].style.width = "250px";
									document.getElementsByClassName("nsi")[21].innerHTML = "Nearest food: " + data.xx + ", " + data.yy + "<br />Setting deg to: " + slitherDeg;

									parent.foodDiv.style.top = dY + (document.height) / 2;
									parent.foodDiv.style.left = dX + (document.width) / 2;
									parent.foodDiv.innerHTML = data.raw_data.gr.toFixed(2);

									parent.setDirection(slitherDeg);
								} else {
									parent.addToFoodBL(data.id);
									parent.foodTimeout(data.id);
								}
							}
						});
					}
				}
				setTimeout(function(){doBot();}, 100);
			});
		}
		doBot();
	};

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
	};

	this.log = function(txt) {
		console.info("[SlitherBot] [" + version + "] " + txt);
	};

	this.computeDistance = function(x1, y1, x2, y2, s1, s2) { // x:1, y:1, x:2, y:2, size:1, size:2
       	s1 = s1 || 0;
        s2 = s2 || 0;
        return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2) - (s1 + s2);
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
};
