class MyEventEmitter {
  constructor() {
    this._events = Object.create(null);

    this.on = this.addListener;
  }

  addListener(type, callback, flag) {
    if (!this._events) this._events = Object.create(null);

    if (this._events[type]) {
      if (flag) {
        this._events[type].unshift(callback);
      } else {
        this._events[type].push(callback);
      }
    } else {
      this._events[type] = [callback];
    }
  }

  once(type, callback, flag) {
    function newCallback(...args) {
      callback.apply(this, args);
      this.removeListen(type, newCallback);
    }

    this.addListener(type, newCallback, flag);
  }

  removeListen(type, callback) {
    if (this._events[type]) {
      this._events[type] = this._events[type].filter(fn => fn !== callback);
    }
  }

  emit(type, ...value) {
    if (!this._events[type]) return;

    this._events[type].forEach(fn => fn.apply(this, value));
  }
}

const events = new MyEventEmitter();
const onFn = () => {
  console.log('on1');
};
const onceFn = () => {
  console.log('once2');
};
events.on('test', onFn);
events.once('test', onceFn);
events.emit('test');
console.log('+++++++++')
// events.removeListen('test', onFn)
events.emit('test');
