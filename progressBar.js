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
    verifyType : function (status /*当前调用状态*/, args) {
        var bool = true;
        switch (status) {
            case 'init':
                //检测类型
                if (this.type.indexOf(args[0]) == -1) {
                    throwError.init("type", "\r\ninit() : 进度条类型不存在");
                    bool = false;
                }
                //检测宽度百分比
                if (Math.abs(parseInt(args[1])) != args[1]) {
                    throwError.init("width", "\r\ninit() : 进度条宽度百分比必须为正整数");
                    bool = false;
                }
                //检测传入百分比
                if (Math.abs(parseInt(args[2])) != args[2]) {
                    throwError.init("percent", "\r\ninit() : 进度百分比必须为正整数");
                    bool = false;
                }
                //验证背景色
                if (!this.rgbReg.test(args[3]) && !this.colorReg.test(args[3])) {
                    throwError.init("bgcolor", "\r\ninit() : 背景颜色值有误,请使用rgb或16进制颜色值,颜色值勿带空格");
                    bool = false;
                }
                //验证进度条颜色值
                if (!this.rgbReg.test(args[4]) && !this.colorReg.test(args[4])) {
                    throwError.init("barcolor", "\r\ninit() : 进度条颜色值有误,请使用rgb或16进制颜色值,颜色值勿带空格");
                    bool = false;
                }
                //验证等份数
                if (Math.abs(parseInt(args[5])) != args[5]) {
                    throwError.init("num", "\r\ninit() : 等份数必须为正整数");
                    bool = false;
                }
                break;
            case 'add':
                //检测传入百分比
                if (Math.abs(parseInt(args[0])) != args[0]) {
                    throwError.init("endPercent", "\r\nadd() : 进度百分比必须为正整数");
                    bool = false;
                }
                //验证等份数
                if (Math.abs(parseInt(args[1])) != args[1]) {
                    throwError.init("num", "\r\nadd() : 等份数必须为正整数");
                    bool = false;
                }
                break;
            case 'refund':
                //检测传入百分比
                if (Math.abs(parseInt(args[0])) != args[0]) {
                    throwError.init("endPercent", "\r\nrefund() : 进度百分比必须为正整数");
                    bool = false;
                }
                //验证等份数
                if (Math.abs(parseInt(args[1])) != args[1]) {
                    throwError.init("num", "\r\nrefund() : 等份数必须为正整数");
                    bool = false;
                }
                break;
            case 'reload':
                //验证等份数
                for (let i = 0; i < args[0].length; i++) {
                    if (Math.abs(parseInt(args[0][i])) != args[0][i]) {
                        throwError.init("num", "\r\nreload() : 等份数必须为正整数");
                        bool = false;
                        break;
                    }
                }
                break;
            default:
                bool = false;
                break;
        }
        return bool;
    },
    initCanvas : function (w /*画布宽度*/, h /*画布高度*/, canvas_id /*画布ID属性*/) {
        let canvas = document.getElementById(canvas_id);
        let dpr = window.devicePixelRatio;
        //以下解决锯齿问题
        //样式表宽高使用实际像素
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        //标签属性宽高使用实际像素*设备dpi比例
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        return canvas;
    },
    cricleStyle : function(pbObj /*参数集*/, widthPercent /*宽度百分比*/, num /*等份数*/) {
        pbObj['pi']       = this.pi;
        pbObj['excricle'] = Math.floor(pbObj['width'] * (widthPercent / 100) / 2); //外圆半径
        pbObj['incricle'] = Math.floor(pbObj['excricle'] * 0.9);                   //内圆半径
        pbObj['fontsize'] = Math.floor(pbObj['excricle'] * 0.5);                   //文字大小
        pbObj['center']   = pbObj['excricle'];                                     //圆心位置（相对画布左上角，向右向下偏移多少）
        let canvas        = this.initCanvas(pbObj['excricle'] * 2, pbObj['excricle'] * 2, pbObj['canvas_id']);

        
        /*canvas开始绘制*/
        let ctx = pbObj['ctx'] = canvas.getContext("2d");
        ctx.translate(0.5, 0.5);  //解决canvas线条模糊问题
        //按照window.devicePixelRatio输出设备dpi比例放大绘制图像（解决锯齿问题）
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        pbObj['ds']       = this.annularStart(ctx, pbObj, num);
        return pbObj;
    },
    annularStart: function(ctx /*画布对象*/, pbObj /*参数集*/, num /*等份数*/){

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
    init : function (type /*进度条类型*/, widthPercent /*宽度百分比*/, percent /*进度百分比*/, bgcolor /*背景色*/, barcolor /*进度条颜色*/, canvas_id /*画布ID属性*/, num /*等份数*/) {
        
        //验证传入参数
        let bool = this.verifyType('init', [type, widthPercent, percent, bgcolor, barcolor, num]);
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
    reload : function(pbObjs /*参数集（数组）*/, nums /*等份数数组*/){

        //校验参数集数组和等份数数组长度是否一致
        if (pbObjs.length !== nums.length) {
            throwError.init('"pbObjs" and "nums"', "长度不一致");return;
        }

        //校验参数类型
        let bool = this.verifyType('reload', [nums]);
        if (!bool) {
            return;
        }

        //重新绘制多个canvas（包括底图）
        for (let i = 0; i < pbObjs.length; i++) {
            clearInterval(pbObjs[i]['ds']);
            switch (pbObjs[i]['type']) {
                case 'pureColorAnnular':
                    let canvas      = this.initCanvas(pbObjs[i]['excricle'] * 2, pbObjs[i]['excricle'] * 2, pbObjs[i]['canvas_id']);
                    pbObjs[i]['ds'] = this.annularStart(canvas, pbObjs[i], nums[i]);
                    break;
                default:
                    break;
            }
        }

        return pbObjs;
    },
    add : function(pbObj /*参数集*/, endPercent /*结束进度值*/, num /*等份数*/) {

        //校验开始进度值是否大于结束进度值
        if (pbObj['percent'] >= endPercent) {
            throwError.init('endPercent', '结束进度值必须大于原有进度值');return;
        }

        //校验参数类型
        let bool = this.verifyType('add', [endPercent, num]);
        if (!bool) {
            return;
        }

        //重新绘制进度条（底图除外）
        let countByPB = 1;
        clearInterval(pbObj['ds']);

        //开始百分比值
        let startPercent = pbObj['percent'];
        //增加百分比值
        let addPercent = endPercent - pbObj['percent'];
        switch (pbObj['type']) {
            case 'pureColorAnnular':
                let ds = setInterval(function() {
                    if (countByPB >= num) {clearInterval(ds);}
                    let eqNum = addPercent / num * countByPB + startPercent; //等份百分比值
                    let stopAngle = eqNum / 100 * 360;                       //结束角度
                    progressBarStart.pureCricle(pbObj, eqNum, stopAngle);
                    countByPB ++;
                }, 10);
                pbObj['ds'] = ds;
                break;
            default :
                break;
        }
        //覆盖参数集中的百分比
        pbObj['percent'] = endPercent;
        return pbObj;

    },
    refund : function (pbObj /*参数集*/, endPercent /*结束进度值*/, num /*等份数*/) {
        
        //校验开始进度值是否小于结束进度值
        if (pbObj['percent'] <= endPercent) {
            throwError.init('endPercent', '结束进度值必须小于原有进度值');return;
        }

        //校验参数类型
        let bool = this.verifyType('refund', [endPercent, num]);
        if (!bool) {
            return;
        }

        //重新绘制进度条（底图除外）
        let countByPB = 1;
        clearInterval(pbObj['ds']);

        //开始百分比值
        let startPercent = pbObj['percent'];
        //减少百分比值
        let refundPercent = pbObj['percent'] - endPercent;
        switch (pbObj['type']) {
            case 'pureColorAnnular':
                let ds = setInterval(function() {
                    if (countByPB >= num) {clearInterval(ds);}
                    let eqNum = startPercent - (refundPercent / num * countByPB); //等份百分比值
                    let stopAngle = 360 - (eqNum / 100 * 360);                    //结束角度
                    progressBarStart.pureCricle(pbObj, eqNum, stopAngle, true);
                    countByPB ++;
                }, 10);
                pbObj['ds'] = ds;
                break;
            default :
                break;
        }
        //覆盖参数集中的百分比
        pbObj['percent'] = endPercent;
        return pbObj;
    }
}

var progressBarStart = {
    pureCricle : function (pbObj /*参数集*/, eqNum /*当前百分值*/, stopAngle /*扇形角度*/, isRefund = false /*是否减少*/) {

        //百分比扇形
		pbObj.ctx.fillStyle = pbObj.ctx.strokeStyle = isRefund ? pbObj.bgcolor : pbObj.barcolor;
		pbObj.ctx.beginPath();

		pbObj.ctx.globalCompositeOperation = 'source-over';

		pbObj.ctx.moveTo(pbObj.center, pbObj.center);
        pbObj.ctx.lineTo(pbObj.center, 0);
		
		if (isRefund) {
            if (stopAngle >= 270) { //右上角角度取结束角度与水平线角度差值（负值）
                stopAngle = 0 - (stopAngle - 270);
            }else{
                stopAngle = 270 - stopAngle;
            }
            //逆时针方向绘制背景色扇形
            pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 270 * pbObj.pi, stopAngle * pbObj.pi, true);
        }else{
            if (stopAngle >= 90) { //右上角角度取结束角度与水平线角度差值（负值）
                stopAngle -= 90;
            }else{
                stopAngle += 270;
            }
            //顺时针方向绘制进度扇形
            if (stopAngle === 270) {
                pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 0, 360 * pbObj.pi, false);
            }else{
                pbObj.ctx.arc(pbObj.center, pbObj.center, pbObj.excricle, 270 * pbObj.pi, stopAngle * pbObj.pi, false);
            }
        }
        // pbObj.ctx.lineTo(pbObj.center, pbObj.center);
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
        pbObj.ctx.fillStyle    = pbObj.barcolor;
        pbObj.ctx.fillText(String(Math.ceil(eqNum)) + '%', pbObj.center, pbObj.center);
        
        return;
    }
}