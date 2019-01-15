## 环形进度条

[环形示例](https://bin7096.github.io/progressBar/progressBar.html)  https://bin7096.github.io/progressBar/progressBar.html

### html:
```html
<!DOCTYPE html>
<html>
<head>
    <title>进度条演示</title>
</head>
<style type="text/css">
    *{margin:0;padding:0;}
    html,body{height:100%;background-color:#FFFFFF;}
</style>
<body>
    <div class="progressBarDiv">
        <canvas id="progressBar"></canvas>
    </div>
	<div class="progressBarDiv" height="300">
		
	</div>
	<div class="progressBarDiv">
		<canvas id="progressBar2"></canvas>
	</div>
	<div class="progressBarDiv" height="300">
		
	</div>
	<div class="progressBarDiv">
		<canvas id="progressBar3"></canvas>
	</div>
</body>
<script type="text/javascript" src="progressBar.js"></script>
</html>
```

### js:
```js
window.onload = function (){
	var vConsole = new VConsole();

	var resize_num = 0;

	//用来传递参数集
	var obj1;
	var obj2;
	var obj3;

	/**
	 * 初始化进度条 progressBar.init(type, widthPercent, percent, bgcolor, barcolor, canvas_id, num)
	 * @param type         string 进度条类型
	 * @param widthPercent int    宽度百分比
	 * @param percent      int    进度百分比
	 * @param bgcolor      string 背景色
	 * @param barcolor     string 进度条颜色
	 * @param canvas_id    string canvas画布ID属性
	 * @param num          int    等份数
	 */
	var styleObj1 = obj1 = progressBar.init('pureColorAnnular', 30, 50, 'rgb(146,80,58)', '#3399FF', 'progressBar', 100);
	var styleObj2 = obj2 = progressBar.init('pureColorAnnular', 60, 30, '#CCC', '#3399FF', 'progressBar2', 200);
	var styleObj3 = obj3 = progressBar.init('pureColorAnnular', 90, 30, '#CCC', 'rgb(146,80,58)', 'progressBar3', 300);


	//progressBar.js中的定时器都是10毫秒，注意按照上一步传递的等份数延时执行增加和减少方法
	setTimeout(function () {
		/**
		 * 增加 progressBar.add(pbObj, endPercent, num)
		 * @param pbObj      Object 上一步执行返回的参数集对象
		 * @param endPercent int    增加后最终百分比值
		 * @param num        int    等份数
		 */
		let addObj1 = obj1 = progressBar.add(styleObj1, 70, 100);
		let addObj2 = obj2 = progressBar.add(styleObj2, 60, 200);
		let addObj3 = obj3 = progressBar.add(styleObj3, 80, 300);

		setTimeout(function () {
			/**
			 * 减少 progressBar.refund(pbObj, endPercent, num)
			 * @param pbObj      Object 上一步执行返回的参数集对象
			 * @param endPercent int    减少后最终百分比值
			 * @param num        int    等份数
			 */
			let addObj4 = obj1 = progressBar.refund(addObj1, 30, 100);
			let addObj5 = obj2 = progressBar.refund(addObj2, 50, 50);
			let addObj6 = obj3 = progressBar.refund(addObj3, 60, 300);
		},3001);

	},3001);

	//页面宽高发生变化时重载
	window.onresize = function(){
		if (resize_num !== 0) {
			return;						//阻止onresize事件多次触发问题
		}
		resize_num ++;

		// 重新加载canvas
		
		/**
		 * 重载 progressBar.reload(pbObjs, nums)
		 * @param pbObjs Array 重载前最后调用的参数集（1个或以上），以数组形式传递
		 * @param nums   Array 对应多个参数集的等份数
		 */
		progressBar.reload([obj1, obj2, obj3], [100, 200, 150]);
		
		setTimeout(function(){
			resize_num = 0;
		}, 100);
	}
}
```
