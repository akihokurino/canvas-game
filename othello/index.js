// JavaScript Document

/*----------コードルール----------*/
/*
オセロ用の石
-1: 白
1: 黒
0: 何も無い
*/



/*----------グローバル変数定義----------*/

var mouseX = 0;
var mouseY = 0;

//オセロの盤上におけるマウスの位置
var mouseBlockX = mouseX / blockSize;
var mouseBlockY = mouseY / blockSize;

var blockSize = 60;
var canvasSize = blockSize * 8;

var gameEndFlag = 0;
var turn = 1;

var boad = new Array(8);

var blackStoneNum = 0;
var whiteStoneNum = 0;

var canvas;
var ctx;

var width;
var height;



/*----------初期処理----------*/

window.onload = function(){
	init();
}



/*----------init関数（初期処理）----------*/

function init(){
	canvas = document.getElementById("canvas");


	//画面調整
	canvas.width = width = canvasSize;
	canvas.height = height = canvasSize;

	ctx = canvas.getContext("2d");

	//背景の描画
	ctx.beginPath();
	ctx.fillStyle = "#006400";
	ctx.fillRect(0, 0, width, height);


	//マウス操作処理
	canvas.addEventListener("mousemove", mouseMove, false);
	canvas.addEventListener("mousedown", mouseDown, false);

	//document.getElementById("undo").addEventListener("click", undo, false);


	//順番の初期化
	turn = 1;


	//ゲーム開始
	gameEndFlag = 0;


	//ボードの初期化（２次元配列）
	for(var i = 0; i < 8; i++){
		boad[i] = new Array(8);

		for(var j = 0; j < 8; j++){
			boad[i][j] = 0;
		}
	}

	boad[3][3] = boad[4][4] = 1;
	boad[3][4] = boad[4][3] = -1;

	draw(ctx, canvas);
}



/*----------mouseMove関数----------*/

function mouseMove(e){
	e.preventDefault();

	if(gameEndFlag == 0){
		moveMouse(e);
		//draw(ctx, canvas);
	}
}



/*----------mouseDown関数----------*/

function mouseDown(e){
	e.preventDefault();

	if(gameEndFlag == 0){
		putStone();
		draw(ctx, canvas);
	}
	else{
		//リスタート
		init();
	}
}



/*----------moveMouse関数----------*/

function moveMouse(e){
	if(e){
		mouseX = e.pageX - canvas.offsetLeft;
		mouseY = e.pageY - canvas.offsetTop;
	}
	else{
		mouseX = e.offsetX;
		mouseY = e.offsetY;
	}


	//実座標
	mouseX = mouseX / canvas.offsetWidth * canvasSize;
	mouseY = mouseY / canvas.offsetHeight * canvasSize;


	//マス座標
	mouseBlockX = Math.floor(mouseX / blockSize);
	mouseBlockY = Math.floor(mouseY / blockSize);

	/*
	console.log(mouseBlockX);
	console.log(mouseBlockY);
	*/
}



/*----------turnStone関数（石を返す処理）----------*/

function turnStone(x, y, i, j, mode){
	//その位置に石がない場合
	if(i == 0 && j == 0){
		return 0;
	}

	x += i;
	y += j;


	//例外処理
	if(x < 0 || x > 7 || y < 0 || y > 7){
		return 0;
	}


	//何も無い時
	if(boad[x][y] == 0){
		return 0;
	}
	//自分の石がある時
	else if(boad[x][y] == turn){
		return 3;
	}
	//相手の石がある時
	else{
		//最後に自分の石があればひっくり返す
		if(turnStone(x, y, i, j, mode) >= 2){
			if(mode != 0){
				//その座標にある石を自分の色にする
				boad[x][y] = turn;
			}
			return 2;
		}
		return 1;
	}
}



/*----------putStone関数----------*/

function putStone(){

	/*
	console.log(mouseBlockX);
	console.log(mouseBlockY);
	*/


	//そこに石がないかどうかを判定
	if(boad[mouseBlockX][mouseBlockY] != 0){
		return;
	}


	//石を返せるかどうかの判定フラグ
	var turnCheck = 0;


	//石を返せるかどうかの判定
	for(var i = -1; i <= 1; i++){
		for(var j = -1; j <= 1; j++){
			if(turnStone(mouseBlockX, mouseBlockY, i, j, 1) == 2){
				turnCheck = 1;
			}
		}
	}

	if(turnCheck == 0){
		return;
	}


	//石を置く（その座標にある石を自分の色にする）
	boad[mouseBlockX][mouseBlockY] = turn;


	//順番を入れ替える
	turn *= -1;


	//置けるかどうかの確認（ゲームが終わったかどうかを判定するため）
	turnCheck = 0;

	for(var x = 0; x < 8; x++){
		for(var y = 0; y < 8; y++){
			if(boad[x][y] == 0){
				for(var i = -1; i <= 1; i++){
					for(var j = -1; j <= 1; j++){
						if(turnStone(x, y, i, j, 0) == 2){
							turnCheck = 1;
							break;
						}
					}

					if(turnCheck != 0){
						break;
					}
				}

				if(turnCheck != 0){
					break;
				}
			}
		}

		if(turnCheck != 0){
			break;
		}
	}

	//置けないときは順番はそのままで再チェック
	if(turnCheck == 0){
		turn *= -1;

		var turnCheck = 0;

		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 8; y++){
				if(boad[x][y] == 0){
					for(var i = -1; i <= 1; i++){
						for(var j = -1; j <= 1; j++){
							if(turnStone(x, y, i, j, 0) == 2){
								turnCheck = 1;
								break;
							}
						}

						if(turnCheck != 0){
							break;
						}
					}

					if(turnCheck != 0){
						break;
					}
				}
			}

			if(turnCheck != 0){
				break;
			}
		}

		//終了判定
		if(turnCheck == 0){
			gameOver();
			return;
		}
	}


	//ゲームの終了判定
	var gameCheck = 0;


	//マスが全て埋め尽くされているどうかの判定
	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){
			if(boad[i][j] == 0){
				gameCheck = 1;
				break;
			}
		}

		if(gameCheck != 0){
			break;
		}
	}

	if(gameCheck == 0){
		gameOver();
		return;
	}
}



/*----------draw関数（描画処理）----------*/

function draw(ctx, canvas){
	//画面のクリア処理
	ctx.clearRect(0, 0, canvasSize, canvasSize);

	//背景の描画
	ctx.beginPath();
	ctx.fillStyle = "#006400";
	ctx.fillRect(0, 0, width, height);


	//罫線の描画処理
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.strokeStyle = "#000000";

	for(var i = 0; i < 8; i++){
		//縦ライン
		ctx.moveTo(i * blockSize, 0);
		ctx.lineTo(i * blockSize, canvasSize);

		//横ライン
		ctx.moveTo(0, i * blockSize);
		ctx.lineTo(canvasSize, i * blockSize);
	}

	ctx.stroke();


	//石の描画処理
	for(var x = 0; x < 8; x++){
		for(var y = 0; y < 8; y++){
			//石がある場所の描画処理
			if(boad[x][y] == 1 || boad[x][y] == -1){
				ctx.beginPath();

				if(boad[x][y] == 1){
					ctx.fillStyle = "#000000";
				}
				else if(boad[x][y] == -1){
					ctx.fillStyle = "#ffffff";
				}

				ctx.strokeStyle = "#000000";
				ctx.arc(
					x * blockSize + (blockSize * 0.5),
				 	y * blockSize + (blockSize * 0.5),
				 	blockSize / 2 * 0.8, 0, 2 * Math.PI, false
				);
				ctx.fill();
				ctx.stroke();
			}
		}
	}
}



/*----------gameOver関数----------*/

function gameOver(){
	//ゲーム終了フラグ
	var gameEndFlag = 1;

	//石のカウント処理
	blackStoneNum = 0;
	whiteStoneNum = 0;

	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){
			if(boad[i][j] == 1){
				blackStoneNum ++;
			}
			else if(boad[i][j] == -1){
				whiteStoneNum ++;
			}
		}
	}
}


