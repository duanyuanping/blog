# requestAnimationFrame

## 优点

setTimeout 和 setInterval 这两个 api 在最初学习 js 的时候就开始接触，但学到后面我们慢慢会发现如下劣势：

- 时间间隔不精确（回调会被放入执行队列，执行队列其他函数执行需要消耗一定时间）

- 过度渲染问题（设置的间隔时间小于浏览器绘制的间隔）

- 掉帧情况（一部分浏览器的显示频率为 16.7ms，前面都是 16.7ms 后回调，此时我们加入一个 setInterval 设置 10ms 执行回调就会出现，那么在第三次调用前面 16.7ms 的回调是就会和后面 10ms 的发生拥挤，这时 16.7ms 的就会在第三次出现掉帧的情况，如下图【来自张鑫旭站点中关于 requestAnimationFrame api 介绍文章中的图片】）

  ![](https://image.zhangxinxu.com/image/blog/201309/frame-lost.png)



而 requestAnimationFrame 正好是跟着浏览器的绘制间隔时间，这样就不会出现掉帧以及过度渲染的问题。requestAnimationFrame 函数传入回调函数后，也是将回调函数放入执行队列中，这一帧中他们会按一定的顺序执行，但是当下一帧的时候下一帧就必须停止，并将运行权利交给下一帧，这样每一帧间隔的时间就不会出现不精确的问题，但是还是有这样一个问题如下图和代码：

```
let a = 0
requestAnimationFrame(() => {
  for (let i = 0; i < 9000; i++) {
    a = i
    console.log(`a${i}`)
  }
  requestAnimationFrame(() => {
    console.log(a)
    a = 10000;
    console.log(a)
  })
})
```

![1539697608071](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539697608071.png)

这里没第一帧没执行完就执行下一帧问题上面已经说了是什么原因。

```
let a = 0
requestAnimationFrame(() => {
  for (let i = 0; i < 9000; i++) {
    a = i
    console.log(`a${i}`)
  }
  requestAnimationFrame(() => {
    console.log(a)
    a = 10000;
    console.log(a)
  })
})
requestAnimationFrame(() => {
  for (let i = 0; i < 9000; i++) {
    console.log(`b${i}`)
  }
  requestAnimationFrame(() => {
    console.log('hello')
  })
})
```

![1539697809670](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539697809670.png)

![1539697831310](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539697831310.png)

第一帧队列最前面还没有执行完，就执行第一帧执行队列中的其他函数了，不太清楚这是怎么回事？如果到时我还没想通，有谁看到这篇文章了，麻烦说下出现这种情况的原因。

## 用法

requestAnimationFrame 接受一个函数作为一个回调函数，在调用这个回调函数的时候，这个回调函数会接收到一个参数后面用 timeStamp 表示，“指示当前被 `requestAnimationFrame()` 排序的回调函数被触发的时间。即使每个回调函数的工作量的计算都花了时间，单个帧中的多个回调也都将被传入相同的时间戳”--来自 mdn 解释。

```
requestAnimationFrame(timeStamp => {
  console.log(timeStamp)
})
requestAnimationFrame(timeStamp => {
  console.log(timeStamp)
})
```

![1539698110281](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539698110281.png)

```
requestAnimationFrame(timeStamp => {
  console.log(timeStamp)
  requestAnimationFrame(timeStamp => {
    console.log(timeStamp)
  })
})
requestAnimationFrame(timeStamp => {
  console.log(timeStamp)
})
```

![1539698206123](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539698206123.png)

此函数会返回一个整数，这个整数是请求 ID ，是回调队列中唯一的表示，我们可以将此 ID 传入 cancelAnimationFrame 函数，来取消回调函数的执行。

````
let a = 0
let b = requestAnimationFrame(function test() {
  if (a < 10) {
    a++;
    b = requestAnimationFrame(test);
    console.log(a)
  }
  if ( a > 5) {
    window.cancelAnimationFrame(b)
  }
});
````

![1539702698740](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539702698740.png)

## 兼容

以下对 requestAnimationFrame 函数兼容性封装来自阮一峰的一篇关于 [requestAnimationFrame](https://javascript.ruanyifeng.com/htmlapi/requestanimationframe.html) 的博文。

```
window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
```



## 例子

```
<button id="btn">start</button>
<div id="box" style="width: 100px; height: 100px; background: red;margin-top: 20px;position: absolute;left: 0;"></div>
```

```
const btn = document.getElementById('btn');
const box = document.getElementById('box');
let run = false
let req = 0;

btn.onclick = function() {
  if (run) {
    this.innerHTML = 'start';
    cancelAnimationFrame(req);
  } else {
    this.innerHTML = 'stop';
    req = requestAnimationFrame(function move() {
      box.style.left = `${parseInt(box.style.left) + 1}px`;
      req = requestAnimationFrame(move);
    })
  }
  run = !run;
}
```

![requestAnimationFrame](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/requestAnimationFrame.gif)

gif 图的原因展示有点卡，中间我点击暂停了两次。