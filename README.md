# 贪食蛇单机版&对战online版
游戏元素：①蓝格背景、②主角蛇、③NPC蛇、④食物、⑤计分板、⑥移动端方向键

【贪食蛇单机版】：Canvas 实现，<a target="_blank" href="https://albertlebron.github.io/tanshishe/%E8%B4%AA%E9%A3%9F%E8%9B%87_%E5%8D%95%E6%9C%BA%E7%89%88/tcs.html">预览demo</a><br>

<img alt="游戏截图加载中..." src="images/tcs_%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE.JPG" />

【贪食蛇 online 版】：单机版基础上，借助 nodejs+websocket 完成升级。<a target="_blank" href="http://119.3.144.14:8867">预览demo</a><br>

<img alt="游戏截图加载中..." src="images/tcs_online%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE1.JPG" />
<img alt="游戏截图加载中..." src="images/tcs_online%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE2.JPG" />
<img alt="游戏截图加载中..." src="images/tcs_online%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE3.JPG" />

## 运行
单机版在浏览器中直接打开tcs.html即可。online版需先进入“/贪食蛇对战_online”目录，运行步骤示例如下：<br>
##### 1. 初始化游戏项目依赖<br>
    npm install
##### 2. 执行脚本命令启动服务<br>
    npm run start
##### 3. 浏览器打开项目地址
    localhost:8867

## 操作
PC端上下左右键盘键、移动端界面右下角四个方向键

## 特点
①单机版有NPC蛇群干扰、②对战版有NPC蛇群、其他玩家双干扰

## 优化
①蓝格背景板与其他游戏元素分离为两层 Canvas ，提高渲染性能<br>②单机版中NPC蛇光吃饭不长个儿，在对战版中得以优化

