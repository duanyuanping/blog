以下内容来源与[NodeJS中的事件（EventEmitter） API详解](https://juejin.cn/post/6844903678227251213)

EventEmitter类似与发布订阅。

```js
// 单个事件默认设置的最大监听队列
EventEmitter.defaultMaxListeners = 10;

function EventEmitter() {
  this._events = Object.create(null);
  this._count = EventEmitter.defaultMaxListeners;
}

// 设置同类型事件监听最大个数
EventEmitter.prototype.setMaxListeners = function (count) {
  this._count = count;
}

// 获取同类型事件监听最大个数
EventEmitter.prototype.getMaxListeners = function () {
  return this._count || EventEmitter.defaultMaxListeners;
}

// 移除事件执行程序
EventEmitter.prototype.removeListener = function (type, callback) {
    if(this._events[type]) {
        // 过滤掉当前传入的要移除的 callback
        this._events[type] = this._events[type].filter(fn => {
            return fn !== callback && fn !== callback.realCallback;
        });
    }
}

module.exports = EventEmitter;
```

- on：等同于 addListener 将函数正常添加到 _event 对应事件类型的数组中
- once：将函数添加到 _event 对应事件类型的数组中，但是只能执行一次
- prependListener：将函数添加到 _event 对应事件类型的数组中的前面
- prependOnceListener 将函数添加到 _event 对应事件类型的数组中的前面，但只能执行一次

EventEmitter中的addListener和on
```js
EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (type, callback, flag) {
    // 兼容继承不存在 _events 的情况
    if (!this._events) this._events = Object.create(null);
    // 如果不是第一次添加 callback 存入数组中
    if (this._events[type]) {
        // 是否从数组前面添加 callback
        if (flag) {
            this._events[type].unshift(callback);
        } else {
            this._events[type].push(callback);
        }
    } else {
        // 第一次添加，在 _events 中创建数组并添加 callback 到数组中
        this._events[type] = [callback];
    }

    // 获取事件最大监听个数
    let maxListeners = this.getMaxListeners();

    // 判断 type 类型的事件是否超出最大监听个数，超出打印警告信息
    if (this._events[type].length - 1 === maxListeners) {
        console.error(`MaxListenersExceededWarning: ${maxListeners + 1} ${type} listeners added`);
    }
}
```

通过上面代码可以看出 on 方法的第三个参数其实是服务于 prependListener 方法的，其他添加事件的方法都是基于 on 来实现的，只是在调用 on 的外层做了不同的处理，而我们平时调这些添加事件监听的方法时都只传入 type 和 callback。

```js
// 添加事件监听，从数组的前面追加
EventEmitter.prototype.prependListener = function (type, callback) {
    // 第三个参数为 true 表示从 _events 对应事件类型的数组前面添加 callback
    this.on(type, callback, true);
}
```

```js
// 添加事件监听，只能执行一次
EventEmitter.prototype.once = function (type, callback, flag) {
    let wrap => (...args) {
        callback(...args);

        // 执行 callback 后立即从数组中移除 callback
        this.removeListener(type, wrap);
    }

    // 存储 callback，确保单独使用 removeListener 删除传入的 callback 时可以被删除掉
    wrap.realCallback = callback;

    // 调用 on 添加事件监听
    this.on(type, wrap, flag);
}
```

```js
// 添加事件监听，从数组的前面追加，只执行一次
EventEmitter.prototype.prependOnceListener = function (type, callback) {
    // 第三个参数为 true 表示从 _events 对应事件类型的数组前面添加 callback
    this.once(type, callback, true);
}
```