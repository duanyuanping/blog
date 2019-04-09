# MV*

MV* 可以分成 MVC、MVVM、MVP，下面将逐一讲解，在讲解之前先看下这些字母代表什么意思，如下：

Model：数据管理

View：用户界面

Controller：业务逻辑

Presenter：和 Controller 差不多，也是业务逻辑部分

## MVC

MVC 数据流动：View 接收用户动作，View 调用 Controller 中的处理函数，Controller 处理函数调用 Model 中暴露的修改数据的方法，Model 中的方法将数据更新，数据更新完成后将新的数据发送给 View，View 将数据展示出来。

![](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020106.png)

（图片来自 http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html）

下面将用代码来更清楚的展示这一块的逻辑：

```
// index.html
<input id="num" type="text" />
<button id="increase">+</button>
<button id="decrease">-</button>

<script>
	myapp = {};
</script>
<script src="View.js"></script>
<script src="Controller.js"></script>
<script src="Model.js"></script>
<script>
	// 初始化页面
	const controller = new myapp.Controller();
	controller.init();
</script>
```

```
// View.js
myapp.View = function(controller) {
  const num = document.getElementById('num');
  const increase = document.getElementById('increase');
  const decrease = document.getElementById('decrease');
  // view 渲染 model 传来的数据
  this.render = function(val) {
    num.value = val;
  }
  // view 响应用户动作
  increase.onclick = function() {
    controller.increase();
  }
  decrease.onclick = function() {
    controller.decrease();
  }
}
```

```
// Controller.js
myapp.Controller = function() {
	let model, view;
	// 初始化界面：创建 model、view，将 view 传入 model 注册，model 初始数据渲染
  this.init = function() {
    model = new myapp.Model();
    view = new myapp.View(this);
    
    model.regist(view); // register 函数是 model 中存注册的视图，这样才能让 model 知道通知哪些 view 更新
    mode.notify();
  }
  // 业务逻辑处理，由 view 调用
  this.increase = function() {
    model.increase();
  }
  this.decrease = function() {
    model.decrease();
  }
}
```

```
// Model.js
myapp.Model = function() {
  // 数据存储
  let num = 0;
  // 数据更新
  this.increase = function() {
    num++;
    this.notify();
  }
  this.decrease = function() {
    num--;
    this.notify();
  }
  // 存放注册了的 view
  const views = [];
 	// 注册 view
  this.regist = function(view) {
    views.push(view);
  }
  // 数据变化时，通知注册了的 view 更新页面
  this.notify = function() {
    views.forEach(view => view.render(num));
  }
}
```

##  MVP

MVP 将 Model 和 View之间的直接联系切断，让 View 和 Presenter（原来的 Controller）交互。

View 响应用户的动作，调用 Presenter 中的函数，Presenter 调用 Model 中的函数，Model 更新数据，Present 调用 Model 中读取数据的函数，Model 将数据传给 Presenter，Presenter 调用 View 更新页面的函数并将新的数据传入，View 根据新的数据更新页面。

![](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020109.png)

（图片来自 http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html）

```
// index.html 文件和上面展示的 HTML 文件一样
```

```
// view.js
myapp.View = function(presenter) {
  const num = document.getElementById('num');
  const increase = document.getElementById('increase');
  const decrease = document.getElementById('decrease');

  this.render = function(val) {
    num.value = val;
  }

  increase.onclick = function() {
    presenter.increase();
  }
  decrease.onclick = function() {
    presenter.decrease();
  }
}
```

```
// Presenter.js
myapp.Presenter = function() {
  let view, model;
  this.init = function() {
    view = new myapp.View(this);
    model = new myapp.Model();
    view.render(model.getVal())
  }

  this.increase = function() {
    model.increase();
    view.render(model.getVal())
  }

  this.decrease = function() {
    model.decrease();
    view.render(model.getVal())
  }
}
```

```
// model.js
myapp.Model = function() {
  let val = 0;
  this.increase = function(num) {
    val++;
  }
  this.decrease = function(num) {
    val--;
  }
  this.getVal = function() {
    return val;
  }
}
```

## MVVM

相对于 MVP 来说将 Presenter 改成 ViewModel，当 Model 中的数据更新后会自动反应在 View 中（先获取 UI 控件引用，再更新 UI 控件），不需要开发者额外写处理函数里更新 View。当然，如果 View 发生改变，也可以自动更新 Model





























参考资料：

[你对MVC、MVP、MVVM 三种组合模式分别有什么样的理解？](https://www.zhihu.com/question/20148405)

[MVC，MVP 和 MVVM 的图示-阮一峰](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)

[浅析前端开发中的 MVC/MVP/MVVM 模式](https://juejin.im/post/593021272f301e0058273468)