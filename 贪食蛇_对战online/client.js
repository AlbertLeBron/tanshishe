(function () {
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body,
        dc = d.compatMode == 'CSS1Compat',
        dx = dc ? dd: db,
        ec = encodeURIComponent,
        canvas=document.getElementById('myCanvas'),
        canvas_bg=document.getElementById('cvs_bg');
 
    w.CHAT = {
        msgObj:d.getElementById("message"),
        screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
        username:null,
        userid:null,
        socket:null,
        game:null,
        snkbaby:null,
        toRegame:0,
        //退出，本例只是一个简单的刷新
        logout:function(){
            //this.socket.disconnect();
            location.reload();
        },
        //重新游戏
        reGame:function(){
            document.getElementById('tip').className='';
            this.toRegame=1;
            this.socket.emit('reGame', {userid:this.userid, snkbaby:this.snkbaby});
        },
        //提交聊天消息内容
        submit:function(obj){
            this.socket.emit('message', obj);
        },
        genUid:function(){
            return "player"+new Date().getTime()+""+Math.floor(Math.random()*899+100);
        },
        //更新系统消息，本例中在用户加入、退出的时候调用
        updateSysMsg:function(o, action){
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;
 
            //更新在线人数
            var userhtml = '';
            var separator = '';
            for(key in onlineUsers) {
                if(onlineUsers.hasOwnProperty(key)){
                    userhtml += separator+onlineUsers[key];
                    separator = '、';
                }
            }
            d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
 
            //添加系统消息
            var html = '<section class="system J-mjrlinkWrap J-cutMsg">';
            html += '<div class="msg-system"><span>玩家 “';
            html += user.username;
            html += (action == 'login') ? '” 加入了游戏' : '” 退出了游戏';
            html += '</span></div></section>';
            d.getElementById('broadcast').innerHTML = html;
        },
        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var username = d.getElementById("username").value;
            if(username != ""){
                d.getElementById("username").value = '';
                d.getElementById("loginbox").style.display = 'none';
                d.getElementById("chatbox").style.display = 'block';
                this.init(username);
            }
            return false;
        },
        init:function(username){
            /*
            客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
            实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
            */

            this.userid = this.genUid();
            this.username = username;

            this.game = new start({userid:this.userid, username:this.username});
 
            this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
 
            //连接websocket后端服务器
            this.socket = io.connect('ws://localhost:3000/');
 
            //告诉服务器端有用户登录
            this.socket.emit('login', {userid:this.userid, username:this.username, ch:canvas.height, cw:canvas.width});
 
            //监听新用户登录
            this.socket.on('login', function(o){
                CHAT.updateSysMsg(o, 'login');
                if(CHAT.userid == o.user.userid){
                    canvas.width=o.canvas.width;
                    canvas.height=o.canvas.height;
                    canvas_bg.width=canvas.width;
                    canvas_bg.height=canvas.height;
                    CHAT.snkbaby = o.snkbaby;
                    CHAT.game.drawGrid();
                    //监听消息发送
                    CHAT.socket.on('message', function(obj){
                        CHAT.game.setArgs(obj,CHAT.userid);
                    }); 
                }
            });
 
            //监听用户退出
            this.socket.on('logout', function(o){
                CHAT.updateSysMsg(o, 'logout');
            });

            //监听重新游戏
            this.socket.on('reGame', function(o){
                CHAT.toRegame=0;
            });
 
        }
    };
    //通过“回车”提交用户名
    d.getElementById("username").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.usernameSubmit();
        }
    };

    function start(map){
        canvas.setAttribute("width",  document.body.clientWidth-2);
        canvas.setAttribute("height",  document.body.clientHeight-2);
        canvas_bg.setAttribute("width",  canvas.getAttribute('width'));
        canvas_bg.setAttribute("height",  canvas.getAttribute('height'));
        var ctx=canvas.getContext('2d'), ctx_bg=canvas_bg.getContext('2d');
        this.drawGrid = function(){
            ctx_bg.beginPath();
            for(var i = 0; i<canvas_bg.width; i+=15){
                ctx_bg.moveTo(i+0.5, 0);
                ctx_bg.lineTo(i+0.5, canvas_bg.height);
                ctx_bg.strokeStyle = 'rgba(223,223,231,0.8)';
                ctx_bg.lineWidth = 1;
                ctx_bg.stroke();
            }
            for(var i = 0; i<canvas_bg.height; i+=15){
                ctx_bg.moveTo(0, i+0.5);
                ctx_bg.lineTo(canvas_bg.width, i+0.5);
                ctx_bg.strokeStyle = 'rgba(223,223,231,0.8)';
                ctx_bg.lineWidth = 1;
                ctx_bg.stroke();
            }
            ctx_bg.closePath();
        }
        var snake1 = null, scores = 0, foodList = [], snakeD = [], snkMap = {}, istart = 0;

        this.setArgs = function(map,userid){
            foodList = map.foodList;
            snakeD = map.snakeD;
            snkMap = map.snkMap;
            if(snkMap[userid]){
                snake1 = snkMap[userid]['sn'];
                scores = snake1.scores;
            }else if(!CHAT.toRegame){
                snake1=null;
                document.getElementById('tip').className='active';
            }
            reDraw();
        }

        function reDraw(){
            //清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //画食物
            for(var i=0;i<foodList.length;i++){
                ctx.beginPath();
                ctx.moveTo(foodList[i].x, foodList[i].y);
                ctx.arc(foodList[i].x,foodList[i].y,foodList[i].size,0,2*Math.PI);
                ctx.fillStyle = foodList[i].color;
                ctx.fill();
                ctx.closePath();
            }

            //设置分数
            ctx.beginPath();
            ctx.fillStyle="#0000ff";
            ctx.font = '24px Verdana bold';
            ctx.fillText('吞食 ', canvas.width-200, 50);
            ctx.fillStyle="red";
            ctx.fillText(scores , canvas.width-200+ctx.measureText('吞食 ').width, 50);
            ctx.closePath();

            //画蛇
            for(var i = 0;i<snakeD.length;i++){
                move(snakeD[i]);
            }

            //画蛇名
            for(var key in snkMap){
                ctx.beginPath();
                ctx.font = '13px Verdana bold';
                ctx.fillStyle=key==CHAT.userid?"red":"#777";
                console.log(snkMap[key]['nast'])
                switch(snkMap[key]['nast']){
                    case 1: ctx.fillText(snkMap[key]['na'] , snkMap[key]['sn'].head.x-ctx.measureText(snkMap[key]['na']).width, snkMap[key]['sn'].head.y-13);break;
                    case 2: ctx.fillText(snkMap[key]['na'] , snkMap[key]['sn'].head.x, snkMap[key]['sn'].head.y-13);break;
                    case 3: for(var i=0;i<snkMap[key]['na'].length;i++){ctx.fillText(snkMap[key]['na'][i] , snkMap[key]['sn'].head.x+13, snkMap[key]['sn'].head.y-(snkMap[key]['na'].length-1-i)*15);};break;
                    case 4: for(var i=0;i<snkMap[key]['na'].length;i++){ctx.fillText(snkMap[key]['na'][i] , snkMap[key]['sn'].head.x+13, snkMap[key]['sn'].head.y+(i+1)*15);}
                }
                ctx.closePath();
            }
        }

        function move(e){
            ctx.beginPath();
            ctx.moveTo(e.head.x, e.head.y);
            for(var i = 0; i<e.cor.length; i++){
                ctx.lineTo(e.cor[i].x, e.cor[i].y);
                ctx.strokeStyle=e.style.color;
                ctx.lineWidth=e.style.width;
                ctx.lineCap="round";
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(e.cor[i].x, e.cor[i].y);
            }
            ctx.lineTo(e.tail.x, e.tail.y);
            ctx.strokeStyle=e.style.color;
            ctx.lineWidth=e.style.width;
            ctx.lineCap="round";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            var dirP = e.cor.length?e.cor[0]:e.tail, eyes = {};
            if(dirP.x - e.head.x!=0){
                var dX = dirP.x - e.head.x;
                eyes = {x:e.head.x, y:e.head.y};
                ctx.arc(eyes.x,eyes.y+e.style.width/2,2,0,2*Math.PI);
                ctx.arc(eyes.x,eyes.y-e.style.width/2,2,0,2*Math.PI);
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                ctx.arc(eyes.x,eyes.y+e.style.width/2,1,0,2*Math.PI);
                ctx.arc(eyes.x,eyes.y-e.style.width/2,1,0,2*Math.PI);
                ctx.fillStyle = "#000";
                ctx.fill();
            }else{
                var dY = dirP.y - e.head.y;
                eyes = {x:e.head.x, y:e.head.y};
                ctx.arc(eyes.x+e.style.width/2,eyes.y,2,0,2*Math.PI);
                ctx.arc(eyes.x-e.style.width/2,eyes.y,2,0,2*Math.PI);
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                ctx.arc(eyes.x+e.style.width/2,eyes.y,1,0,2*Math.PI);
                ctx.arc(eyes.x-e.style.width/2,eyes.y,1,0,2*Math.PI);
                ctx.fillStyle = "#000";
                ctx.fill();
            }
            ctx.closePath();
        };

        function dir(event){
            if(!snake1){
                return;
            }
            var e = this;
            var keyCode = e.getAttribute('keyCode')||event.keyCode;
            if(keyCode == 37 || keyCode == 38 || keyCode == 39 || keyCode == 40){
                CHAT.submit({userid:CHAT.userid, keyCode:keyCode});
            }
        }

        //鼠标控制
        document.getElementById('menu1').addEventListener('click',dir,false);
        document.getElementById('menu2').addEventListener('click',dir,false);
        document.getElementById('menu3').addEventListener('click',dir,false);
        document.getElementById('menu4').addEventListener('click',dir,false);
        //键盘控制
        document.documentElement.onkeydown=dir;
    }
    
})();