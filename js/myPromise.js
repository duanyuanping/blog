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