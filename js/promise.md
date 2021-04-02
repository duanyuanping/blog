## 同步调用resolve
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(fn) {
    fn(this.resolve, this.reject);
  }

  // 状态
  status = PENDING

  // 值存储
  value = null
  reason = null

  // 回调存储
  onFulfilledCallback = null;
  onRejectedCallback = null;

  resolve = (value) => {
    if (this.status !== PENDING) return;

    this.value = value;
    this.status = FULFILLED;
  }

  reject = (reason) => {
    if (this.status !== PENDING) return;

    this.reason = reason;
    this.status = REJECTED;
  }

  then(onFulfilled = () => {}, onRejected = () => {}) {
    this.onFulfilledCallback = function () {
      if (this.status === FULFILLED) {
        onFulfilled(this.value);
      }
    }

    this.onRejectedCallback = function () {
      if (this.status === REJECTED) {
        onRejected(this.reason);
      }
    }
  }
}

module.exports = MyPromise;
```

## 支持异步调用resolve()
```js
// ....

class MyPromise {
  //...

  // 回调存储
  onFulfilledCallback = null;
  onRejectedCallback = null;

  resolve = (value) => {
    if (this.status !== PENDING) return;

    this.value = value;
    this.status = FULFILLED;

    this.onFulfilledCallback && this.onFulfilledCallback(value);
  }

  reject = (reason) => {
    if (this.status !== PENDING) return;

    this.reason = reason;
    this.status = REJECTED;

    this.onRejectedCallback && this.onRejectedCallback(reason);
  }

  then(onFulfilled = () => {}, onRejected = () => {}) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }

    if (this.status === REJECTED) {
      onRejected(this.reason);
    }

    if (this.status === PENDING) {
      this.onFulfilledCallback = onFulfilled;
  
      this.onRejectedCallback = onRejected;
    }
  }
}

module.exports = MyPromise;
```

## 使用then向同一个promise对象写入多个回调函数
```js
// 例子
const MyPromise = require('./promise');

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 2000); 
})

promise.then(value => {
  console.log(1)
  console.log('resolve', value)
})
 
promise.then(value => {
  console.log(2)
  console.log('resolve', value)
})

promise.then(value => {
  console.log(3)
  console.log('resolve', value)
})
```
```js
// ...
class Promise {
  // ...

  // 回调存储
  onFulfilledCallback = [];
  onRejectedCallback = [];

  resolve = (value) => {
    if (this.status !== PENDING) return;

    this.value = value;
    this.status = FULFILLED;

    while(this.onFulfilledCallback.length) {
      this.onFulfilledCallback.shift()(value);
    }
  }

  reject = (reason) => {
    if (this.status !== PENDING) return;

    this.reason = reason;
    this.status = REJECTED;

    while(this.onRejectedCallback.length) {
      this.onRejectedCallback.shift()(reason);
    }
  }

  then(onFulfilled = () => {}, onRejected = () => {}) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }

    if (this.status === REJECTED) {
      onRejected(this.reason);
    }

    if (this.status === PENDING) {
      this.onFulfilledCallback.push(onFulfilled);
  
      this.onRejectedCallback.push(onRejected);
    }
  }
}

module.exports = MyPromise;
```

## 添加链式调用
```js
// ...
class MyPromise {
  // ...

  then(onFulfilled = () => {}, onRejected = (reason) => { throw new Error(reason)}) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED || this.status === REJECTED) {
        let data = '';
        try {
          data = this.status === FULFILLED ? onFulfilled(this.value) : onRejected(this.reason);
        } catch (error) {
          return reject(error);
        }

        resolvePromise(data, resolve, reject);
      }
  
      if (this.status === PENDING) {
        this.onFulfilledCallback.push((...params) => {
          let data = '';
          try {
            data = onFulfilled(...params);
          } catch (error) {
            return reject(error);
          }

          resolvePromise(data, resolve, reject);
        });
    
        this.onRejectedCallback.push((...params) => {
          let data = '';
          try {
            data = onRejected(...params);
          } catch (error) {
            return reject(error);
          }

          resolvePromise(data, resolve, reject);
        });
      }
    });
  }
}

function resolvePromise(x, resolve, reject) {
  if (x instanceof MyPromise) {
    return x.then(resolve, reject);
  }

  resolve(x);
}

module.exports = MyPromise;
```

## 微任务
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  // ...

  then(onFulfilled = () => {}, onRejected = (reason) => { throw new Error(reason)}) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED || this.status === REJECTED) {
        process.nextTick(() => {
          let data = '';
          try {
            data = this.status === FULFILLED ? onFulfilled(this.value) : onRejected(this.reason);
          } catch (error) {
            return reject(error);
          }

          resolvePromise(data, resolve, reject);
        });
      }
  
      if (this.status === PENDING) {
        this.onFulfilledCallback.push((...params) => process.nextTick(() => {
          let data = '';
          try {
            data = onFulfilled(...params);
          } catch (error) {
            return reject(error);
          }

          resolvePromise(data, resolve, reject);
        }));
    
        this.onRejectedCallback.push((...params) => process.nextTick(() => {
          let data = '';
          try {
            data = onRejected(...params);
          } catch (error) {
            return reject(error);
          }

          resolvePromise(data, resolve, reject);
        }));
      }
    });
  }
}

function resolvePromise(x, resolve, reject) {
  if (x instanceof MyPromise) {
    // 自己实现
    x.then(resolve, reject)
    // 原生Promise会再次生成一个微任务
    // process.nextTick(() => x.then(resolve, reject))
    return;
  }

  resolve(x);
}

module.exports = MyPromise;
```
## 面试题

```js
Promise.resolve().then(() => {
  console.log(0);
  return MyPromise.resolve(4);
}).then((res) => {
  console.log(res)
})

MyPromise.resolve().then(() => {
  console.log(1);
}).then(() => {
  console.log(2);
}).then(() => {
  console.log(3);
}).then(() => {
  console.log(5);
}).then(() =>{
  console.log(6);
})

// 执行结果 0,1,2,3,4,5,6
```

```js
const MyPromise = require('./MyPromise.js')

MyPromise.resolve().then(() => {
  console.log(0);
  return MyPromise.resolve(4);
}).then((res) => {
  console.log(res)
})

MyPromise.resolve().then(() => {
  console.log(1);
}).then(() => {
  console.log(2);
}).then(() => {
  console.log(3);
}).then(() => {
  console.log(5);
}).then(() =>{
  console.log(6);
})

// 执行结果 0,1,2,4,3,5,6
// 4在2后面，是因为then回调执行的时候，会生成一个微任务，then回调如果返回的是一个promise对象，还会再次调用该对象的then方法获取值
```

自己实现的`MyPromise`和原生实现的`Promise`执行结果有点不一样。这是因为原生中，then回调执行的时候，会生成一个微任务，如果then回调如果返回的是一个promise对象，就会重新生成一个微任务，调用该对象的then方法获取值，这样就生成了两个微任务。