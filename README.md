# 贪食蛇单机版&对战online版
【贪食蛇单机版】：由 canvas 实现，因为单机版，直接下载 tcs.html 后在支持 canvas 的浏览器上打开运行即可。游戏是多年前学习 canvas 时的练手项目，最近升级为 online 版后一并上传。游戏元素：①蓝格背景、②主角蛇、③NPC蛇、④食物、⑤计分板、⑥移动端方向键

【贪食蛇 online 版】：在单机版基础上，辅以 nodejs+websocket 完成升级。原理：nodejs后端服务通过定时器不间断计算每一时刻的待渲染数据，通过 socket 再传到前端，最后再由前端 canvas 实现数据渲染。

操作：PC端上下左右键盘键、移动端界面右下角四个方向键

特点：①单机版有NPC蛇群干扰、②对战版有NPC蛇群、其他玩家双干扰

局限：①不能360°无死角转弯、②不能加速

Bug优化：①将蓝格背景版与其他游戏元素分离为两层 Canvas ，提高渲染性能、②单机版中NPC蛇光吃饭不长个儿，在对战版中得以优化

注：单机版升级为对战版过程中，对于sockect在nodejs中的运用参考了某博主前辈的聊天室项目，现今找不到源地址了抱歉 (。・＿・。)

