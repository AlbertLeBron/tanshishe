# 贪食蛇单机版&对战online版
游戏元素：①蓝格背景、②主角蛇、③NPC蛇、④食物、⑤计分板、⑥移动端方向键

【贪食蛇单机版】：Canvas 实现，<a target="_blank" href="https://albertlebron.github.io/tanshishe/%E8%B4%AA%E9%A3%9F%E8%9B%87_%E5%8D%95%E6%9C%BA%E7%89%88/tcs.html">预览demo</a><br>

<img alt="游戏截图加载中..." src="images/tcs_%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE.JPG" />

【贪食蛇 online 版】：单机版基础上，加上 nodejs+websocket 完成升级

## 操作
PC端上下左右键盘键、移动端界面右下角四个方向键

## 特点
①单机版有NPC蛇群干扰、②对战版有NPC蛇群、其他玩家双干扰

## 局限
①不能360°无死角转弯、②不能加速、③对战时屏幕适应问题

## 优化
①蓝格背景板与其他游戏元素分离为两层 Canvas ，提高渲染性能<br>②单机版中NPC蛇光吃饭不长个儿，在对战版中得以优化
