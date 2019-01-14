var utils = {
    getWindowSize: function() {
        return {
            width: this.getWindowWidth(),
            height: this.getWindowHeight()
        };
    },
    getWindowWidth: function() {
        //浏览器的兼容
        return window.innerWidth || document.documentElement.clientWidth;
    },
    getWindowHeight: function() {
        //浏览器的兼容
        return window.innerHeight || document.documentElement.clientHeight;
    }
}

var throwError = {
    content:"ProgressBar.js Arguments '%arg%' Error!%detail%",
    init:function(arg, detail){
        throw this.content.replace("%arg%", arg).replace("%detail%", detail);return;
    }
}

var progressBar = {
    pi       : Math.PI / 180,
    rgbReg   : new RegExp('^[rR][gG][Bb][Aa]?[\(]((2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),?(0\.\d{1,2}|1|0)?[\)]{1}$'),
    colorReg : new RegExp('^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$'),
    type : [
        'pureColorAnnular'
    ],
    verifyType : function (status /*当前调用状态*/, type /*进度条类型*/, widthPercent /*宽度百分比*/, percent /*进度百分比*/, bgcolor /*背景色*/, barcolor /*进度条颜色*/, num /*等份数*/) {
        var bool = true;
        switch (status) {
            case 'init':
                //检测类型
                if (this.type.indexOf(arguments[1]) == -1) {
                    throwError.init("type", "\r\ninit() : 进度条类型不存在");
                    bool = false;
                }
                //检测宽度百分比
                if (Math.abs(parseInt(arguments[2])) != arguments[2]) {
                    throwError.init("width", "\r\ninit() : 进度条宽度百分比必须为正整数");
                    bool = false;
                }
                //检测传入百分比
                if (Math.abs(parseInt(arguments[3])) != arguments[3]) {
                    throwError.init("percent", "\r\ninit() : 进度百分比必须为正整数");
                    bool = false;
                }
                //验证背景色
                if (!this.rgbReg.test(arguments[4]) && !this.colorReg.test(arguments[4])) {
                    throwError.init("bgcolor", "\r\ninit() : 背景颜色值有误,请使用rgb或16进制颜色值,颜色值勿带空格");
                    bool = false;
                }
                //验证进度条颜色值
                if (!this.rgbReg.test(arguments[5]) && !this.colorReg.test(arguments[5])) {
                    throwError.init("barcolor", "\r\ninit() : 进度条颜色值有误,请使用rgb或16进制颜色值,颜色值勿带空格");
                    bool = false;
                }
                //验证等份数
                if (Math.abs(parseInt(arguments[6])) != arguments[6]) {
                    throwError.init("num", "\r\ninit() : 等份数必须为正整数");
                    bool = false;
                }
                break;
            case 'add':
                //检测传入百分比
                if (Math.abs(parseInt(arguments[1])) != arguments[1]) {
                    throwError.init("endPercent", "\r\nadd() : 进度百分比必须为正整数");
                    bool = false;
                }
                //验证等份数
                if (Math.abs(parseInt(arguments[2])) != arguments[2]) {
                    throwError.init("num", "\r\nadd() : 等份数必须为正整数");
                    bool = false;
                }
                break;
            default:
                bool = false;
                break;
        }
        return bool;
    },
    init : function (type /*进度条类型*/, widthPercent /*宽度百分比*/, percent /*进度百分比*/, bgcolor /*背景色*/, barcolor /*进度条颜色*/, canvas_id /*画布ID属性*/, num /*等份数*/) {
        
        //验证传入参数
        let bool = this.verifyType('init', type, widthPercent, percent, bgcolor, barcolor, num);
        if (!bool) {
            return;
        }

        let bodyWidth  = utils.getWindowWidth();
        //progressBar参数集
        let pbObj = {};
        pbObj['percent']   = percent;       //百分值
        pbObj['bgcolor']   = bgcolor;       //背景色
        pbObj['barcolor']  = barcolor;      //进度条颜色
        pbObj['canvas_id'] = canvas_id;     //画布ID
        pbObj['width']     = bodyWidth;     //画布宽度
        pbObj['type']      = type;          //进度条类型

        switch(type){
			case "pureColorAnnular":
				pbObj = this.cricleStyle(pbObj, widthPercent, num);
				break;
        }
        //返回参数集，方便下次调用
        return pbObj;
    },
    initCanvas : function (w /*画布宽度*/, h /*画布高度*/, canvas_id /*画布ID属性*/) {
        let canvas = document.getElementById(canvas_id);
        canvas.width  = w;
        canvas.height = h;
        return canvas;
    },
    cricleStyle : function(pbObj /*参数集*/, widthPercent /*宽度百分比*/, num /*等份数*/) {
        pbObj['pi']       = this.pi;
        pbObj['excricle'] = Math.floor(pbObj['width'] * (widthPercent / 100) / 2); //外圆半径
        pbObj['incricle'] = Math.floor(pbObj['excricle'] * 0.9);                   //内圆半径
        pbObj['fontsize'] = Math.floor(pbObj['excricle'] * 0.5);                   //文字大小
        pbObj['center']   = pbObj['excricle'];                                     //圆心位置（相对画布左上角，向右向下偏移多少）
        let canvas        = this.initCanvas(pbObj['excricle'] * 2, pbObj['excricle'] * 2, pbObj['canvas_id']);
        pbObj['ds']       = this.annularStart(canvas, pbObj, num);
        return pbObj;
    },
    annularStart: function(canvas /*画布对象*/, pbObj /*参数集*/, num /*等份数*/){

        /*canvas开始绘制*/
        let ctx = pbObj['ctx'] = canvas.getContext("2d");
        
        ctx.translate(0.5, 0.5);  //解决canvas线条模糊问题

        //圆形底图
        ctx.beginPath();
        ctx.fillStyle = pbObj['bgcolor'];
        ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 0, this.pi * 360, true);
        ctx.fill();
        ctx.closePath();

        //环形初始动画
        let countByPB = 1;
        let ds = setInterval(function() {
            if (countByPB >= num) {clearInterval(ds);}
            let eqNum     = pbObj['percent'] / num * countByPB;
            let stopAngle = eqNum / 100 * 360;
            progressBarStart.pureCricle(pbObj, eqNum, stopAngle);
            countByPB ++;
        }, 10);
        return ds;
    },
    add : function(pbObj, endPercent, num) {

        let bool = this.verifyType('add', endPercent, num);
        if (!bool) {
            return;
        }

        let countByPB = 1;
        clearInterval(pbObj['ds']);

        let startPercent = pbObj['percent'];
        let addPercent = endPercent - pbObj['percent'];
        switch (pbObj['type']) {
            case 'pureColorAnnular':
                let ds = setInterval(function() {
                    if (countByPB >= num) {clearInterval(ds);}
                    let eqNum = addPercent / num * countByPB + startPercent;
                    let stopAngle = eqNum / 100 * 360;
                    progressBarStart.pureCricle(pbObj, eqNum, stopAngle);
                    console.log(eqNum);
                    console.log(stopAngle);
                    countByPB ++;
                }, 10);
                pbObj['ds'] = ds;
                break;
            default :
                break;
        }
        pbObj['percent'] = endPercent;
        return pbObj;

    }
}

var progressBarStart = {
    pureCricle : function (pbObj /*参数集*/, eqNum /*当前百分值*/, stopAngle /*扇形角度*/) {

        //百分比扇形
		pbObj.ctx.fillStyle = pbObj.ctx.strokeStyle = pbObj.barcolor;
		pbObj.ctx.beginPath();

		pbObj.ctx.globalCompositeOperation = 'source-over';

		pbObj.ctx.moveTo(pbObj.center, pbObj.center);
		pbObj.ctx.lineTo(pbObj.center, 0);
		
		if (stopAngle >= 90) {
			stopAngle -= 90;
		}else{
			stopAngle += 270;
		}
		if (stopAngle === 270) {
			pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 0, 360 * pbObj.pi, false);
		}else{
			pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 270 * pbObj.pi, stopAngle * pbObj.pi, false);
		}
		pbObj.ctx.fill();
		pbObj.ctx.closePath();

        //内圆遮盖层
		pbObj.ctx.beginPath();
		pbObj.ctx.globalCompositeOperation = 'destination-out';
		pbObj.fillStyle = 'black';
		pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.incricle, 0, pbObj.pi * 360, true);
		pbObj.ctx.fill();

        //百分比文字
		pbObj.ctx.globalCompositeOperation = 'source-over';
		pbObj.ctx.font 	   	   = pbObj.fontsize + 'px Arial';
		pbObj.ctx.textAlign    = 'center';
		pbObj.ctx.textBaseline = 'middle';
        pbObj.ctx.fillText(String(Math.ceil(eqNum)) + '%', pbObj.center, pbObj.center);
        
        return;
    }
}