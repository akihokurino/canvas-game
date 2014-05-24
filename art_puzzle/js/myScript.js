// JavaScript Document

/*----------グローバル変数定義----------*/

var puzzleMaster;
var puzzle;

var puzzleMasterCtx;
var puzzleCtx;

var option = {
	piece: 9,
	col: 3,
	row: 3,
	shuffle: 100
};

var width = 294;
var height = 294;

var pieceWidth = 98;
var pieceHeight = 98;

var pieceData = [];

var pieceIndex = {
	blank: null,
	click: null
};

var start = false;
var finish = false;



/*----------ロード時処理----------*/

window.onload = function(){
	init();
}



/*----------初期処理----------*/

function init(){
	//DOM
	puzzleMaster = document.getElementById("puzzleMaster");
	puzzle = document.getElementById("puzzle");


	puzzleMasterCtx = puzzleMaster.getContext("2d");
	puzzleCtx = puzzle.getContext("2d");


	//画面の再描画
    puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    puzzleCtx.fillRect(0, 0, width + 4, height + 4);

    puzzleMasterCtx.fillStyle = "rgb(0, 0, 0)";
    puzzleMasterCtx.fillRect(0, 0, width + 4, height + 4);


	//配置画像の初期設定（jQueryで実装）
	$("#picZone img").css("opacity", "0");


	//タッチ時処理
	puzzle.addEventListener("mousedown", mouseDown, false);


	//配置画像フェードイン処理
	showPic();


	//画像タッチクリック時処理
	$("#picZone img").click(clickPic);


	//画像アップロード処理
	var picZone = document.getElementById("picZone");
	var file = document.getElementById("file");

	file.addEventListener("change", function(){
		var file = this.files[0];

		if(isImage(file)){
			loadDataURL(file, function(dataURL){
				appendDataURLImage(picZone, dataURL);
			})
		}
	}, false)
}



/*-----------showPic関数----------*/

function showPic(){
	var picIndex = 0;
	var allPic = $("#picZone").children();


	for(var i = 0; i < allPic.length; i++){
		$("#picZone img.pic" + picIndex).animate({
			opacity: "1"
		}, 1000);

		picIndex++;
	}
}



/*----------clickPic関数----------*/

function clickPic(e){
	//ゲームスタート処理
	gameStart(e.target.src);
	//console.log("test");
}



/*----------mouseDown関数----------*/

function mouseDown(e){
	var rect = e.target.getBoundingClientRect();

	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;

	var clickX = Math.floor((mouseX - 1) / pieceWidth);
	var clickY = Math.floor((mouseY - 1) / pieceHeight);


	//クリックしたピースが移動可能なら移動
	if(checkMove(clickX, clickY)){
		movePiece();
	}
}



/*----------gameStart関数----------*/

function gameStart(src){
    resetPuzzle(true);
    loadImg(true, src);
}



/*----------resetPuzzle関数----------*/

function resetPuzzle(resetFlag){
    if(resetFlag){
        pieceIndex.blank = null;
		pieceIndex.click = null;

        start = true;
        finish = false;


		//ピース画像の初期化
        pieceData = [];
    }


	//画面の再描画
    puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    puzzleCtx.fillRect(0, 0, width + 4, height + 4);

    puzzleMasterCtx.fillStyle = "rgb(0, 0, 0)";
    puzzleMasterCtx.fillRect(0, 0, width + 4, height + 4);
}



/*----------loadImg関数----------*/

function loadImg(shuffle, src){
	//仮引数srcが空だった場合デフォルト値を使用
	if(!src){
		src = "Boids Design.jpg";
	}


	//イメージオブジェクトの生成
	var img = new Image();
	img.src = src;


	img.onload = function(){
		//マスター画像の描画処理
		puzzleMasterCtx.drawImage(img, 0, 0, width, height);


		//画像ピース化処理
		createPiece();


		if(shuffle){
			shufflePiece();
		}
	}
}



/*----------createPiece関数----------*/

function createPiece(){
	var pieceNum = 1;
	var piece;

	for(var x = 0; x < option.col; x++){
		for(var y = 0; y < option.row; y++){
			//マスター画像から9枚の画像をトリミングする
			piece = puzzleMasterCtx.getImageData(pieceWidth * x, pieceHeight * y, pieceWidth, pieceHeight);


			//座標格納（隙間に1px空ける)
			piece.posX = 1 + x + pieceWidth * x;
			piece.posY = 1 + y + pieceHeight * y;

			piece.index = pieceNum - 1;
			piece.number = pieceNum;


			//トリミングした画像を上のレイヤーのキャンバスに配置
			puzzleCtx.putImageData(piece, piece.posX, piece.posY);


			//ピースを保存
			pieceData.push(piece);

			pieceNum++;
		}
	}


	if(!finish){
		//ブランク初期設定（最後のピース）
		pieceIndex.blank = option.piece - 1;


		//最後のピースを削除する
		puzzleCtx.fillStyle = "rgb(0, 0, 0)";
		puzzleCtx.fillRect(piece.posX, piece.posY, pieceWidth, pieceHeight);
	}
}



/*----------shufflePiece関数----------*/

function shufflePiece(){
	for(var i = 0; i < option.shuffle; i++){
		//ランダムにクリック座標を取得
		var _clickX = Math.floor(Math.random() * option.col);
		var _clickY = Math.floor(Math.random() * option.row);


		//クリックしたピースが移動可能なら移動
		if(checkMove(_clickX, _clickY)){
			movePiece("shuffle");
		}
	}
}



/*----------checkMove関数----------*/

function checkMove(x, y){
	//クリックしたピースのindex値を取得
	pieceIndex.click = x * option.col + y;


	//キャンバス外のクリックは無効
	if(x < 0 || x >= option.col){
		return;
	}

	if(y < 0 || y >= option.row){
		return;
	}


	//ピースが移動できるかの判定処理
	switch(pieceIndex.click){
		//クリックしたピースの下にブランクがある場合
		case pieceIndex.blank - 1:


		//クリックしたピースの上にブランクがある場合
		case pieceIndex.blank + 1:


		//クリックしたピースの左にブランクがある場合
		case pieceIndex.blank + option.col:


		//クリックしたピースの右にブランクがある場合
		case pieceIndex.blank - option.col:
			return true;
			break;


		//それ以外の場合はfalseを返す
		default:
			return false;
			break;
	}
}



/*----------movePiece関数----------*/

function movePiece(mode){
	var clickIndex = getPieceIndex(pieceIndex.click);
	var blankIndex = getPieceIndex(pieceIndex.blank);
	/*
	console.log(clickIndex);
	console.log(blankIndex);
	*/


	//クリックしたピースのデータを取得
	var clickPiece = pieceData[pieceIndex.click];
	//console.log(clickPiece.index);


	//現在のブランクピースのデータを取得
	var blankPiece = pieceData[pieceIndex.blank];
	//console.log(blankPiece.index);


	//クリックした位置のピースを黒で塗りつぶす
	puzzleCtx.fillStyle = "rgb(0, 0, 0)";
	puzzleCtx.fillRect(clickPiece.posX - 1, clickPiece.posY - 1, pieceWidth + 2, pieceHeight + 2);


	//現在ブランクになっている位置にクリックしたピースの画像を配置する
	puzzleCtx.putImageData(pieceData[clickIndex], blankPiece.posX, blankPiece.posY);
	//console.log(pieceData[clickIndex].index);


	//index入れ替え処理
	pieceData[clickIndex].index = [pieceIndex.blank, pieceData[blankIndex].index = pieceIndex.click][0];


	//blank入れ替え処理
    pieceIndex.blank = [pieceIndex.click, pieceIndex.click = null][0];


	//ゲーム終了判定（シャッフルの時には適応しない）
	if(mode == "" && checkEnd){
		setTimeout(gameEnd, 1000);
	}
}



/*----------getPieceIndex関数----------*/

function getPieceIndex(num){
	for(var i = 0; i < pieceData.length; i++){
		if(pieceData[i].index === num){
			return i;
		}
	}
}



/*----------checkEnd関数----------*/

function checkEnd(){
	var endFlag = true;


	//画像が元の位置にもどっているかどうかをチェック
	for(var i = 0; i < pieceData.length; i++){
		if(pieceData[i].number !== pieceData[i].index + 1){
			endFlag = false;
			break;
		}
	}

	return endFlag;
}



/*----------gameEnd関数----------*/

function gameEnd(){
	var lastPiece = pieceData[option.piece - 1];

	finish = true;

	puzzleCtx.putImageData(lastPiece, lastPiece.posX, lastPiece.posY);
}



/*----------isImage関数----------*/

function isImage(file){
	return file.type.match("image.*") ? true : false;
}



/*----------loadDataURL関数----------*/

function loadDataURL(file, callback){
	var reader = new FileReader();

	reader.readAsDataURL(file);

	reader.onload = function(){
		callback(this.result);
	}
}



/*----------appendDataURLImage関数----------*/

function appendDataURLImage(elem, dataURL){
	var img = document.createElement("img");
	img.setAttribute("src", dataURL);
	img.style.opacity = 1;
	img.addEventListener("click", clickPic, false);

	elem.appendChild(img);
}

