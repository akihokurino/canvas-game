// JavaScript Document

/*----------グローバル変数定義----------*/

var imgList = [
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Boids Design.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Abstract.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Canvas.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Circle Moving Design.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Particle Rotate3D.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Spider Design.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Lightning.jpg",
	"http://akiho-develop.under.jp/portfolio/myApp/color_function/img/Line Art2.jpg"
];

var imgIndex = Math.floor(imgList.length * Math.random());

var images;

var image;
var source;

var canvas;
var ctx;

var input_1;
var input_2;

var lightnessMap = null;
var generating = true;
var timeoutID = null;

var canvas_zone;

var pictureIndex = 0;
var timer;



/*----------初期処理----------*/

window.onload = function(){
	canvas = document.createElement("canvas");
	canvas_zone = document.getElementById("canvas_zone");

	canvas_zone.appendChild(canvas);


	ctx = canvas.getContext("2d");


	//イメージオブジェクト生成
	source = new Image();


	//初期indexのプリセット画像でソースを設定
	setSource(imgList[imgIndex]);

	source.onload = sourceLoad;


	input_1 = document.getElementById("color_1");
	input_2 = document.getElementById("color_2");

	input_1.addEventListener("change", colorChange, false);
	input_2.addEventListener("change", colorChange, false);


	//画像リストの表示処理
	showPicture();


	//画像クリック処理
	images = document.getElementsByTagName("img");
	//console.log(images.length);

	for(var i = 0; i < images.length; i++){
		images[i].addEventListener("click", changeImage, false);
	}
}



/*----------changeImage関数----------*/

function changeImage(e){
	//console.log(e.target.id);


	//すでに生成中なら無効
	if(generating){
		return;
	}


	//クリックした画像によって条件分岐
	switch(e.target.id){
		case "output_0":
			setSource(imgList[0]);
			break;

		case "output_1":
			setSource(imgList[1]);
			break;

		case "output_2":
			setSource(imgList[2]);
			break;

		case "output_3":
			setSource(imgList[3]);
			break;

		case "output_4":
			setSource(imgList[4]);
			break;

		case "output_5":
			setSource(imgList[5]);
			break;

		case "output_6":
			setSource(imgList[6]);
			break;

		case "output_7":
			setSource(imgList[7]);
			break;

		default:
			return;
	}
}



/*----------setSource関数----------*/

function setSource(src){
	generating = true;

	if(source.src !== src){
		source.src = src;
		sourceLoad();
	}
	else{
		//画像が同じ場合はイベントハンドラを強制的に実行
		sourceLoad();
	}
}



/*----------sourceLoad関数---------*/

function sourceLoad(){
	//明度マップを破棄
	lightnessMap = null;


	//生成開始
	if(timeoutID){
		clearTimeout(timeoutID);
	}

	timeoutID = setTimeout(generate, 0);
}



/*----------generate関数----------*/

function generate(){
	//画像とキャンバスのサイズを設定して取得し、検出を開始
	var width = canvas.width = source.width = 400;
	var height = canvas.height = source.height = 400;


	//選択した画像をキャンバスに描画する
	ctx.drawImage(source, 0, 0, width, height);


	//描画したイメージオブジェクトをビットマップデータとして取得
	var imageData = ctx.getImageData(0, 0, width, height);
	var data = imageData.data;


	//明度マップが無ければ生成
	if(!lightnessMap){
		lightnessMap = createLightnessMap(imageData);
	}


	var hex_1 = input_1.value;
	var hex_2 = input_2.value;

	var color_1 = hexToRgb(hex_1);
	var color_2 = hexToRgb(hex_2);


	var _data = lightnessMap;
	var _colorLerp = colorLerp;


	//各ピクセル毎に値を変更
	for(var i = 0; i < _data.length; i++){
		var color = _colorLerp(color_1, color_2, _data[i]);
		var j = i << 2;

		data[j] += (color >> 16) & 0xFF;
		data[j + 1] += (color >> 8) & 0xFF;
		data[j + 2] += (color >> 0) & 0xFF;
	}


	//変更した画像データを再度キャンバスに配置
	ctx.putImageData(imageData, 0, 0);


	//生成の完了
	generating = false;
}



/*----------createLightnessMap関数----------*/

function createLightnessMap(imageData){
	var width = Math.floor(imageData.width);
	var height = Math.floor(imageData.height);
	var data = imageData.data;

	var _data;

	if(window.Float32Array){
		//ピクセルデータを1次元配列として変数に保存
		_data = new Float32Array(data.length / 4);
	}
	else{
		_data = [];
	}


	var vtor = 1 / 255;

	for(var i = 0; i < height; i++){
		var step =  i * height;

		for(var j = 0; j < width; j++){
			var x = (j + step);
			var y = x << 2;
			var r = data[y];
			var g = data[y + 1];
			var b = data[y + 2];

			_data[x] = ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * vtor;
		}
	}

	return _data;
}



/*----------hexToRgb関数----------*/

function hexToRgb(code){
	code = code.replace(/^\s*#|\s*$/g, '');
    code = code.toLowerCase();


    //Hex
    if(code.length === 3){
        //Hex 3 digit -> 6 digit
    	code = code.replace(/(.)/g, '$1$1');
    }

    var match = code.match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);

    if(match){
        return 255 << 24 | (parseInt(match[1], 16) << 16) | (parseInt(match[2], 16) << 8) | parseInt(match[3], 16);
   	}

    return null;
}



/*----------colorLerp関数----------*/

function colorLerp(c1, c2, w2){
	//2色を混合する
	var r1 = c1 >> 16 & 0xFF, g1 = c1 >> 8 & 0xFF, b1 = c1 >> 0 & 0xFF;
    var r2 = c2 >> 16 & 0xFF, g2 = c2 >> 8 & 0xFF, b2 = c2 >> 0 & 0xFF;

    var w1 = 1 - w2;

    var r = (r1 * w1 + r2 * w2) & 0xFF;
    var g = (g1 * w1 + g2 * w2) & 0xFF;
    var b = (b1 * w1 + b2 * w2) & 0xFF;

    return 255 << 24 | (r << 16) | (g << 8) | b;
}



/*----------colorChange関数----------*/

function colorChange(e){
	generating = true;

	if(timeoutID){
		clearTimeout(timeoutID);
	}


	//色の値を変えて再生成
	timeoutID = setTimeout(generate, 500);
}



/*----------showPicture関数----------*/

function showPicture(){
	$("#output_" + pictureIndex).animate({
		opacity: "1"
	}, 1000);

	pictureIndex++;

	if(pictureIndex === 7){
		clearTimeout(timer);
	}

	timer = setTimeout(showPicture, 500);
}
