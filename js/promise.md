同步调用resolve
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
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

  catch(onRejected) {
    if (this.status === REJECTED) {
      onRejected(this.resolve);
    }
  }
}

module.exports = Promise;
```

支持异步调用resolve()
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
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

  catch(onRejected) {
    if (this.status === REJECTED) {
      onRejected(this.resolve);
    }
  }
}

module.exports = Promise;
```

使用then向同一个promise对象写入多个回调函数
```js
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
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise {
  constructor(fn) {
    fn(this.resolve, this.reject);
  }

  // 状态
  status = PENDING

  // 值存储
  value = null
  reason = null

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

module.exports = Promise;
```

添加链式调用
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

  then(onFulfilled = () => {}, onRejected = (reason) => { throw new Error(reason)}) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED || this.status === REJECTED) {
        let data = '';
        try {
          data = this.status === FULFILLED ? onFulfilled(this.value) : onRejected(this.reason);
        } catch (error) {
          return reject(error);
        }

        return resolve(data);
      }
  
      if (this.status === PENDING) {
        this.onFulfilledCallback.push((...params) => {
          let data = '';
          try {
            data = onFulfilled(...params);
          } catch (error) {
            return reject(error);
          }

          resolve(data);
        });
    
        this.onRejectedCallback.push((...params) => {
          let data = '';
          try {
            data = onRejected(...params);
          } catch (error) {
            return reject(error);
          }

          resolve(data);
        });
      }
    });
  }
}

module.exports = MyPromise;
```