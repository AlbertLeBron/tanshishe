# 贪食蛇单机版&对战online版
贪食蛇单机版：由 canvas 实现，因为单机版，直接下载 tcs.html 后在支持 canvas 的浏览器上打开运行即可。游戏是多年前学习 canvas 时的练手项目，最近升级后 online 版后一并上传。游戏元素：①蓝格背景、②主角蛇、③NPC蛇、④食物、⑤计分板、⑥移动端方向键

贪食蛇online版：在单机版基础上，辅以 nodejs+websocket 完成升级。原理：nodejs后端服务通过定时器计算不间断计算每一时刻的待渲染数据，通过 socket 再传到前端，最后再由前端 canvas 实现数据渲染。

