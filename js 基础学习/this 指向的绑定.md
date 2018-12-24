# this 指向的绑定

this 对象的绑定方法有四种：

- 默认绑定
- 隐式绑定
- 显式绑定
- new 绑定

## 默认绑定

平常经常使用的函数调用，如下展示：

```
function foo() {
  console.log(this)
}
foo();
// 这里打印出来的是 window 对象，这里实际执行的是 window.foo()
```

严格模式下禁止 this 指向全局对象：

```
function foo() {
	'use strict';

  console.log(this)
}
foo();
// 这里打印出来的是 undefined
```

## 隐式绑定

调用的函数如果不是 window，那么这个函数中的 this 将会指向最近的一个调用对象，代码展示如下：

```
var obj = {
  foo: function() {
    console.log(this)
  }
}
obj.foo();
// 这里打印出来的是 obj 对象，因为 foo 函数调用的位置是 obj 对象。
```

```
var obj1 = {
	a: 1,
  foo: function() {
    console.log(this.a)
  }
}

var obj2 = {
  obj1: obj1,
  a: 2
}

obj2.obj1.foo();
// 这里打印出来的是 1，因为最近调用 foo 函数的对象是 obj1
```

### 隐式丢失

这也属于 this 绑定的范畴，这里函数内的 this 指向绑定将会应用默认绑定，展示代码如下：

```
var obj = {
  foo: function() {
    console.log(this)
  }
}
var bar = obj.foo;
bar();
// 打印出来的是 window 对象，因为前面讲 obj.foo 函数赋值给 bar 变量，然后执行 bar 函数（window.bar()）
```

```
var obj = {
  foo: function() {
    console.log(this)
  }
}

setTimeout(obj.foo, 1000);
// 一秒后将会打印出 window 对象，这里实际和前一个例子差不多，这里也是先将 obj.foo 函数赋值给一个变量，然后在一秒后执行（window.setTimeout(obj.foo, 1000)）
```

## 显示绑定

显示绑定将会用到一下三个函数：call、apply、bind。这三个函数都是用来修改函数调用对象的。call 和 apply 类似，都是绑定调用对象后马上执行，他们之间的差别是传参的方式不同，call 接收多个多个参数列表，而 apply 接收的是一个包含多个参数的数组作为函数执行的参数，代码展示如下：

```
var obj = {
  a: 1
}
var a = 0;
function foo(arg1, arg2) {
  console.log(this.a + arg1 + arg2)
}
foo.call(obj, 10, 10);
foo.apply(obj, [10, 10]);
// 两个函数执行效果都是一样的，打印出来的都是 21
```

使用 bind 方法绑定不会立即执行函数，而会在函数绑定调用对象后后会返回一个包装函数，执行这个函数除了 this 的指向外，其他都不会有任何变化。

```
var obj = {
  a: 1
}
var a = 0;
function foo() {
  console.log(this)
}
var bar = foo.bind(obj);
bar();
// 这里打印出来的是 1
```

## new 绑定

我们都知道在使用 new 生成一个新的实例的时候，会先生成一个新的对象，然后将构造函数的 this 指向新生成的对象，执行构造函数。这里就是展示的就是 new 生成实例的时候修改 this 指向。

```
function Foo() {
  console.log(this)
}
new Foo();
// 这里将会打印 Foo 实例出来的对象
```

## 不同绑定之间的优先级

首先我们可以判断的是在这四种绑定中默认绑定的优先级是最低的，因为其他三种绑定都是在有默认绑定的条件存在下实施的。

### 隐式绑定 vs 显示绑定

```
var obj1 = {
	a: 1,
  foo: function() {
    console.log(this.a)
  }
}
var obj2 = {
  a: 2
}
obj1.foo.call(obj2);
// 这里打印出来的是 2
```

由上面代码运行的结果我们就可以得出显示绑定的优先级大于隐式绑定。

### 隐式绑定 vs new 绑定

```
var obj = {
	a: 1,
  Foo: function() {
    console.log(this)
  }
}
new obj.Foo();
// 这里打印出来的是 Foo 实例
```

所以 new 绑定的优先级高于隐式绑定。

### 显示绑定 vs new 绑定

```
var obj = {
  a: 1,
}
function foo() {
  console.log(this);
}
var bar = foo.bind(obj);
new bar();
// 这里打印出来的是 foo 的实例对象
```

下面展示另外一个例子：

```
function bind(fn, obj) {
  return function() {
    fn.apply(obj, arguments);
  }
} 

var obj = {
  a: 1,
}
function foo() {
  console.log(this);
}
var bar = bind(foo, obj);
new bar();
// 这里打印出来的就是 obj 对象
```

出现上面的原因是源生的 bind 在包装函数的时候，包装函数内部会对包装函数中的 this 进行判断，判断是否是使用 new 来新建的实例，下面是 mdn 提供的一个 bind 实现：

```
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      throw new TypeError(
        "..." +
        "..."
      );
    }
    
    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function() {};
    var fBound = function() {
      return fToBind.apply(
      	this instanceof fNOP && oThis ? this : oThis
      	// 这里判断绑定函数调用的方式，来确定 this 指向什么对象
      ),
      aArgs.concat(Array.prototype.slice.call(arguments));
    };
    
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    // 上面这两行代码为什么不直接使用（fBound.prototype = this.prototype）来替换呢？
    // mdn 那样做的原因：一般为实例添加公共属性是添加到构造函数的原型上面，所以这里防止用户在为 fBound 函数原型添加新的属性的时候无意间修改绑定函数的 prototype（虽然像这样做了以后用户还是可以通过 fBound.prototype.__proto__ 修改到）
    
    return fBound;
  }
}
```

实际上 mdn 提供的方法和源生上面还是有一定的差别，如下：

```
var obj = {
	a: 1
}
function foo() {}
var bar = foo.bind(obj)
console.log(bar.prototype)
// 这段代码中，如果源生的 bind 绑定对象后返回的包装函数的原型是 undefined，而 mdn 实现的 bind 方法返回的是 foo 的实例
```

## 箭头函数

箭头函数中没有 this，所以箭头函数中使用的 this 是定义箭头函数时函数所在作用域的 this，后面调用箭头函数时都无法再修改 this（闭包），展示代码如下：

```
var obj = {
	a: 1,
  foo: () => {
    console.log(this)
  }
}
var a = 0;

obj.foo()
// 这里将打印 window 对象，因为在开始定义的时候本作用域中的 this 指向的是 window 对象
```

## call & apply 实现

前面已经展示了 bind 的实现，那么这里将展示 call 和 apply 模拟实现：

### call 模拟实现

```
// 这里 call 是 es3 就支持了，所以就不使用 es6 的语法来实现
Function.prototype.call2 = function(context) {
  context = context || window;
  // 如果外面使用 call(null) 来进行绑定，那就默认绑定到 window 上
  context.fn = this; 
  // 这里使用的 fn 来存放绑定函数，实际中应该使用的不易重复的名字来表示的
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']');
  }
  var result = eval('context.fn(' + args + ')');
  delete context.fn;
  return result;
}
```

### apply 模拟实现

```
Function.prototype.apply2 = function(context, arr) {
  context = context || window;
  context.fn = this;
  var result;
  if (!arr) {
    return context.fn();
  } else {
    var args = [];
    for (var i = 1; i < arr.length; i++) {
      args.push('arr[' + i + ']');
    }
    result = eval('context.fn(' + args + ')');
  }

  delete context.fn;
  return result;
}
```



 







