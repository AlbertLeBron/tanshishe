var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.send('<h1>Welcome Realtime Server</h1>');
});
 
//在线玩家
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
//画布宽高
var canvas = {width:0,height:0}
//游戏句柄
var game=null;
//当前在线人数站位队列
var onlineArr=[];
 
io.on('connection', function(socket){
    console.log('某用户已接入...');   
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;
        if(!game){
            console.log('');
            console.log('重新开局');
            canvas.height = obj.ch;
            canvas.width = obj.cw;
            game = new start(canvas);
            onlineArr.push(obj.userid);
            onlineUsers[obj.userid] = obj.username;
            game.newPlayer(obj.userid,obj.username);
            //在线人数+1
            onlineCount++;
            game.animate();
        }else{
            //检查在线列表，如果不在里面就加入
            if(!onlineUsers.hasOwnProperty(obj.userid)) {
                var userOrder = onlineArr.indexOf('');
                if(userOrder>-1){
                    onlineArr[userOrder]=obj.userid;
                }else{
                    onlineArr.push(obj.userid);
                }
                onlineUsers[obj.userid] = obj.username;
                game.newPlayer(obj.userid,obj.username);
                //在线人数+1
                onlineCount++;
            }
        }
         
        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj, canvas:canvas, snkbaby:game.snkMap[obj.userid]});
        console.log(obj.username+'加入了游戏');

        //监听玩家操作
        socket.on('message', function(obj){
            //设置玩家操作
            game.setPlayer(obj);
        });
    });

    socket.on('reGame', function(obj){
        if(game!=null){
            game.snkMap[obj.userid]=obj.snkbaby;
            io.emit('reGame', {});
        }
    });
     
    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};
             
            //删除
            delete onlineUsers[socket.name];
            delete game.snkMap[socket.name];
            //在线人数-1
            onlineCount--;
             
            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出游戏');
            var userOrder = onlineArr.indexOf(obj.userid);
            if(userOrder==onlineArr.length-1){
                onlineArr.pop();
            }else{
                onlineArr[userOrder]='';
            }
            game.state = onlineArr.length;
        }
    });
     
    function start(canvas){
        var colorList = ['#E0110B', '#CB00F3', '#7BBB89', '#4B9316', '#E3548C', '#72366A', '#EDD743', '#4F90BA', '#16C5FA', '#003300', '#6600CC', '#990066', '#CC9966'];
        var count = 0, count2 = 0, foodList = [], snakeD = [], snkMap={}, snakes = [], t, handle = this;
        this.snkMap = snkMap;
        this.state = 1;


        this.newPlayer = function(userid,username){
            var l = onlineArr.indexOf(userid)+1;
            snkMap[userid]={'sn':new Snake({x:canvas.width/2-Math.round(Math.pow(-1,l))*75, y:canvas.height/(l+1)*l}, {x:canvas.width/2-Math.round(Math.pow(-1,l))*150, y:canvas.height/(l+1)*l}, {color:colorList[Math.floor(Math.random()*colorList.length)], width:14}, {x:0, y: 0}),
                            'na':username,
                            'nast':0
                           };
        }

        this.setPlayer = function(map){
            if(snkMap[map.userid]){
                var snake1 = snkMap[map.userid]['sn'];
                var spd = snake1.speed;
                switch(Number(map.keyCode)){
                    case 37: snake1.speed = {x:-3, y: 0}; break;
                    case 38: snake1.speed = {x: 0, y:-3}; break;
                    case 39: snake1.speed = {x: 3, y: 0}; break;
                    case 40: snake1.speed = {x: 0, y: 3}; break;
                }
                if(spd.x != snake1.speed.x || spd.y != snake1.speed.y){
                    snake1.cor.unshift({x:snake1.head.x, y:snake1.head.y});
                }
            }
        }

        function Snake(head, tail, style, speed){
            this.head = head;
            this.tail = tail;
            this.style = style;
            this.cor = [];
            this.speed = speed;
            this.ss=0;
            this.scores=0;
        }

        function setFood(){
            if(count == 20 && foodList.length<100 && Math.floor(Math.random()*2)){
                var times = Math.floor(Math.random()*3)+1;
                for(var i = 0;i<times; i++){
                    foodList.push({x:Math.random()*canvas.width, 
                                    y:Math.random()*canvas.height, 
                                    color:colorList[Math.floor(Math.random()*colorList.length)], 
                                    size:(Math.floor(Math.random()*5)+3)});
                }
            }
            count = count==20?0:count;
            var fl = [], snkl = 0;
            var sks = [].concat(snakes);
            for(var key in snkMap){
                snkMap[key]['sn'].ss=0;
                sks.push(snkMap[key]['sn']);
                snkl++;
            }
            outer:
            for(var i = 0; i<foodList.length; i++){
                for(var j = 0; j<sks.length; j++){
                    if(Math.pow(sks[j].head.x-foodList[i].x, 2) + Math.pow(sks[j].head.y-foodList[i].y, 2) < Math.pow(foodList[i].size+sks[j].style.width/2, 2)){
                        if(j >=sks.length-snkl){
                            sks[j].scores += foodList[i].size;
                            sks[j].ss += foodList[i].size;
                        }
                        continue outer;
                    }
                }
                
                fl.push(foodList[i]);
            }
            foodList = fl;
            count++;
        }

        function setSnakes(){

            if(count == 20 && snakes.length<10 && Math.floor(Math.random()*2)){
                var times = Math.floor(Math.random()*3)+1;
                for(var i = 0;i<times; i++){
                    var headList = [{x:0, y:7+Math.random()*(canvas.height-14)}, 
                                    {x:canvas.width, y:7+Math.random()*(canvas.height-14)}, 
                                    {x:7+Math.random()*(canvas.width-14), y:0}, 
                                    {x:7+Math.random()*(canvas.width-14), y:canvas.height}];
                    var sd = Math.floor(Math.random()*4), nt = {}, spd = {};
                    switch(sd){
                        case 0: nt = {x:-120-Math.random()*100, y:headList[0].y}; spd = {x: 3, y: 0};break;
                        case 1: nt = {x:canvas.width+120+Math.random()*100, y:headList[1].y}; spd = {x:-3, y: 0};break;
                        case 2: nt = {x:headList[2].x, y:-120-Math.random()*100}; spd = {x: 0, y: 3};break;
                        case 3: nt = {x:headList[3].x, y:canvas.height+120+Math.random()*100}; spd = {x: 0, y:-3};break;
                    }
                    snakes.push(new Snake(headList[sd], nt, {color:colorList[Math.floor(Math.random()*9)], width:14}, spd));
                }
            }
            if(count2 == 60){
                for(var i = 0; i<snakes.length; i++){
                    if(Math.floor(Math.random()*4) && (snakes[i].tail.x>0 && snakes[i].tail.y>0)){
                        var spd = snakes[i].speed;
                        var speeds = [{x:-3, y: 0}, {x: 0, y:-3}, {x: 3, y: 0}, {x: 0, y: 3}];
                        snakes[i].speed = speeds[Math.floor(Math.random()*4)];
                        if(spd.x != snakes[i].speed.x || spd.y != snakes[i].speed.y){
                            snakes[i].cor.unshift({x:snakes[i].head.x, y:snakes[i].head.y});
                        }
                    }
                }
            }
            count2 = count2 == 60?0:count2;
            count2++;
        }

        function allMove(){
            var snks = [], snkl = 0, naar= [];
            for(var key in snkMap){
                snakes.push(snkMap[key]['sn']);
                naar.push(key);
                snkl++;
            }
            snakeD = [];
            for(var i = 0; i<snakes.length; i++){
                move(snakes[i]);
                var sk = [].concat(snakes), nohit = true;
                sk.splice(i, 1);
                outer:
                for(var j = 0;j<sk.length; j++){
                    var cp = [].concat(sk[j].cor);
                    cp.unshift(sk[j].head);
                    cp.push(sk[j].tail);
                    for(var n = 0; n<cp.length-1; n++){
                        if((cp[n].x-cp[n+1].x!=0 && (snakes[i].head.x-cp[n].x)*(snakes[i].head.x-cp[n+1].x)<=0 && Math.abs(snakes[i].head.y-cp[n].y)<snakes[i].style.width/2+sk[j].style.width/2) || (cp[n].x-cp[n+1].x==0 && (snakes[i].head.y-cp[n].y)*(snakes[i].head.y-cp[n+1].y)<=0 && Math.abs(snakes[i].head.x-cp[n].x)<snakes[i].style.width/2+sk[j].style.width/2)){                   
                                nohit = false;
                                break outer;                    
                        }
                    }
                }
                if(i>=snakes.length-snkl && (!nohit || snakes[i].head.x<=0 || snakes[i].head.x>=canvas.width || snakes[i].head.y<=0 || snakes[i].head.y>=canvas.height)){
                    delete snkMap[naar[i+naar.length-snakes.length]];
                }
                if(nohit && snakes[i].head.x>0 && snakes[i].head.x<canvas.width && snakes[i].head.y>0 && snakes[i].head.y<canvas.height && i<snakes.length-snkl){
                    snks.push(snakes[i]);
                }
            }
            snakes = snks;
            for(var key in snkMap){
                var endp = snkMap[key]['sn'].cor.length?snkMap[key]['sn'].cor[0]:snkMap[key]['sn'].tail;                   
                if(snkMap[key]['sn'].head.x-endp.x!=0){
                    if(snkMap[key]['sn'].head.x-endp.x>0){
                        snkMap[key]['nast']=1;        
                    }else{
                        snkMap[key]['nast']=2;
                    }
                }else{
                    if(snkMap[key]['sn'].head.y-endp.y>0){
                        snkMap[key]['nast']=3;         
                    }else{
                        snkMap[key]['nast']=4;
                    }
                }
            }
        }

        function move(e){
            snakeD.push(JSON.parse(JSON.stringify(e)));
            var dirP = e.cor.length?e.cor[0]:e.tail;
            if(dirP.x - e.head.x!=0){
                var dX = dirP.x - e.head.x;
            }else{
                var dY = dirP.y - e.head.y;
            }
            var advance, endp = {};
            if(e.cor.length){
                var pl = e.ss, prep = e.tail;
                while(Math.abs(e.cor[e.cor.length-1].x+e.cor[e.cor.length-1].y-prep.x-prep.y)+pl <= Math.abs(e.speed.x+e.speed.y)){
                    pl +=Math.abs(e.cor[e.cor.length-1].x+e.cor[e.cor.length-1].y-prep.x-prep.y);
                    prep = {x:e.cor[e.cor.length-1].x, y:e.cor[e.cor.length-1].y};
                    e.cor.pop();
                    if(!e.cor.length){
                        break;
                    }
                }
                advance = Math.abs(e.speed.x+e.speed.y)-pl;
                endp = prep;
            }else{
                advance = Math.abs(e.speed.x+e.speed.y)-e.ss;
                endp = e.tail;
            }
            var dirP = e.cor.length?e.cor[e.cor.length-1]:e.head;
            if(dirP.x - endp.x!=0){
                var dX = dirP.x - endp.x;
                endp.x += dX/Math.abs(dX)*advance;
            }else{
                var dY = dirP.y - endp.y;
                endp.y += dY/Math.abs(dY)*advance;
            }
            e.tail = endp;
            e.head.x = e.head.x + e.speed.x;
            e.head.y = e.head.y + e.speed.y;
        }

        function allRun(){     
            setFood();
            setSnakes();
            allMove();
            io.emit('message', {foodList:foodList, snakeD:snakeD, snkMap:snkMap});
        }

        this.animate = function(){
            clearInterval(t);
            t= setInterval(function(){
                allRun();
                if(!handle.state){
                    clearInterval(t);
                    game=null;
                    console.log('玩家团灭，此局结束。');
                }
            },30);
        }
    }
   
});
 
http.listen(3000, function(){
    console.log('listening on *:3000');
});