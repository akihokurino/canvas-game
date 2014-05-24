
/*----------グローバル変数定義----------*/

var ctx;

var width;
var height;

var bugsList = [];
var bugsNum = 30;

var colors = [
	"red",
	"blue",
	"green"
];

var mouseX;
var mouseY;

var pointZone;
var score = 0;



/*----------初期処理----------*/

window.onload = function(){
	var canvas = document.getElementById("canvas");
	width = canvas.width = 600;
	height = canvas.height = 600;

	ctx = canvas.getContext("2d");


	//画面の初期化
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);


	//オブジェクト生成処理
	for(var i = 0; i < bugsNum; i++){
		var bug = new Bug(Math.random() * width, Math.random() * height);
		bugsList.push(bug);
	}


	//マウス処理
	canvas.addEventListener("mousedown", attack, false);
	canvas.addEventListener("touchstart", attack, false);


	//得点用のDOM
	pointZone = document.getElementById("point");
	pointZone.innerHTML = score;


	//速度調節処理
	var controller = document.getElementById("speedCont");
	var btns = controller.getElementsByTagName("span");

	for(var i = 0; i < btns.length; i++){
		btns[i].addEventListener("click", changeSpeed, false);
	}


	//アニメーション
	setInterval(frame, 1000 / 60);
}



/*----------frame関数----------*/

function frame(){
	//画面の再描画
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);


	//各オブジェクト同士の衝突判定処理（配列で隣同士のオブジェクトを比較）
	for(var i = 0; i < bugsList.length - 1; i++){
		var bug_A = bugsList[i];

		for(var j = 1; j < bugsList.length; j++){
			var bug_B = bugsList[j];

			var dx = bug_B.x - bug_A.x;
			var dy = bug_B.y - bug_A.y;

			var dist = Math.sqrt(dx * dx + dy * dy);
			var minDist = bug_A.radius + bug_B.radius;

			if(dist < minDist){
				//オブジェクト同士が衝突していれば反発処理
				var angle = Math.atan2(dy, dx);
				var spring = 0.6

				var tx = bug_A.x + Math.cos(angle) * minDist;
				var ty = bug_A.y + Math.sin(angle) * minDist;

				var ax = (tx - bug_B.x) * spring;
				var ay = (ty - bug_B.y) * spring;


				bug_A.vx -= ax;
				bug_A.vy -= ay;

				bug_B.vx += ax;
				bug_B.vy += ay;

			}
		}
	}


	//オブジェクト更新処理
	for(var i = 0; i < bugsList.length; i++){
		var bug = bugsList[i];

		bug.update();
		bug.draw();

		//ボーナス用オブジェクト
		var bonusBug = bugsList[bugsList.length - 1];
		bonusBug.colorID = 3;
		bonusBug.color = "#ff1493";
	}
}



/*----------attack関数----------*/

function attack(e){
	e.preventDefault();

	if(e.type == "mousedown"){
		var rect = e.target.getBoundingClientRect();

		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}
	else if(e.type == "touchstart"){
		mouseX = e.layerX;
		mouseY = e.layerY;
	}


	//オブジェクトとクリック位置の相対位置を判定
	for(var i = 0; i < bugsList.length; i++){
		var bug = bugsList[i];

		var dx = mouseX - bug.x;
		var dy = mouseY - bug.y;

		var dist = Math.sqrt(dx * dx + dy * dy);


		//クリックした位置がオブジェクトの範囲内であればオブジェクト削除、得点計算
		if(dist < bug.radius){
			pointCheck(bug.colorID);
			destory(i);

			return;
		}
	}
}



/*----------destory関数----------*/

function destory(index){
	bugsList.splice(index, 1);
}



/*----------pointCheck関数----------*/

function pointCheck(id){
	//赤:-5, 青:+5, 緑:+10
	switch(id){
		case 0:
			score -= 10;
			pointZone.style.color = "red";
			break;
		case 1:
			score += 5;
			pointZone.style.color = "blue";
			break;
		case 2:
			score += 10;
			pointZone.style.color = "green";
			break;
		case 3:
			score += 20;
			pointZone.style.color = "#ff1493";
			break;
	}

	pointZone.innerHTML = score;
}



/*----------speedCheck関数----------*/

function changeSpeed(e){
	//alert("test");
	var id = e.target.id;

	switch(id){
		case "slow":
			for(var i = 0; i < bugsList.length; i++){
				bugsList[i].speed = 0.1;
			}
			console.log(bugsList[0].speed);
			break;

		case "normal":
			for(var i = 0; i < bugsList.length; i++){
				bugsList[i].speed = 5;
			}
			break;

		case "fast":
			for(var i = 0; i < bugsList.length; i++){
				bugsList[i].speed = 10;
			}
			break;
	}
}



/*----------randfloat関数----------*/

function randfloat(min, max){
	return Math.random() * (max - min) + min;
}



/*----------Bugクラス----------*/

var Bug = function(x, y){
	this.x = x;
	this.y = y;

	this.vx = Math.random() * 6 - 3;
	this.vy = Math.random() * 6 - 3;

	this.rotation = randfloat(0, 360);
	this.speed = 5;
	this.radius = randfloat(15, 25);
	this.angle = (this.rotation + 270) * Math.PI / 180;

	this.timer = 0;

	this.moveTime = Math.floor(randfloat(100, 300));
	this.waitTime = 50;

	this.moveFlag = true;

	this.colorID = Math.floor(Math.random() * 3);
	this.color = colors[this.colorID];
	console.log(this.colorID);
}

Bug.prototype = {
	update: function(){
		this.timer++;


		//オブジェクト制御処理
		if((this.timer < this.moveTime) && this.moveFlag){
			this.moveFlag = true;
		}

		if((this.timer == this.moveTime) && this.moveFlag){
			this.timer = 0;

			this.moveFlag = false;
		}

		if((this.timer < this.waitTime) && !this.moveFlag){
			this.moveFlag = false;
		}

		if((this.timer == this.waitTime) && !this.moveFlag){
			this.timer = 0;

			this.moveFlag = true;

			this.changeColor();
		}


		if(this.moveFlag){
			this.move();
		}
		else{
			this.wait();
		}
	},

	//移動処理
	move: function(){
		this.vx += Math.random() * 6 - 3;
		this.vy += Math.random() * 6 - 3;

		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;

		this.x += this.vx;
		this.y += this.vy;

		this.vx *= 0.9;
		this.vy *= 0.9;

		if(this.x < 0){
			this.x = width;
		}
		else if(this.x > width){
			this.x = 0;
		}

		if(this.y < 0){
			this.y = height;
		}
		else if(this.y > height){
			this.y = 0;
		}
	},

	//停止処理
	wait: function(){
		//停止処理なのでなにも記述しない
	},

	//描画処理
	draw: function(){
		ctx.beginPath();
		ctx.globalCompositeOperation = "lighter";
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 180, false);
		ctx.fill();
	},

	//色変更処理
	changeColor: function(){
		this.colorID++;

		if(this.colorID > 2){
			this.colorID = 0;
		}

		this.color = colors[this.colorID];
	}
}