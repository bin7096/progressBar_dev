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
</body>
<script type="text/javascript" src="progressBar.js"></script>
</html>
```

### js:
```js
var resize_num = 0;

/**
 * progressBar.init(type, widthPercent, percent, bgcolor, barcolor, canvas_id, num) 初始化进度条
 * @param type         进度条类型
 * @param widthPercent 宽度百分比
 * @param percent      进度百分比
 * @param bgcolor      背景色
 * @param barcolor     进度条颜色
 * @param canvas_id    canvas画布ID属性
 * @param num          等份数
 */
progressBar.init('pureColorAnnular', 60, 50, 'rgb(146,80,58)', '#3399FF', 'progressBar', 100);

//页面宽高发生变化时重载
window.onresize = function(){
    if (resize_num !== 0) {
        return;						//阻止onresize事件多次触发问题
    }
    resize_num ++;

    //根据页面变化前已加载的值传递参数
    progressBar.init('pureColorAnnular', 60, 50, 'rgb(146,80,58)', '#3399FF', 'progressBar', 100);
    
    setTimeout(function(){
        resize_num = 0;
    }, 100);
}
```
