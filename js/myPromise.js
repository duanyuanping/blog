const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(fn) {
    try {
      fn(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  // 状态
  status = PENDING

  // 值存储
  value = null
  reason = null

  // 回调存储
  onFulfilledCallback = [];
  onRejectedCallback = [];

  static resolve = (value) => {
    return new MyPromise(resolve => {
      resolve(value);
    });
  }

  static reject = (value) => {
    return new MyPromise((_, reject) => {
      reject(value);
    });
  }

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