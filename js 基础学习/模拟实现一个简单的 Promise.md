```
// 模拟实现了 resolve、reject、then、catch 方法

function Promise(executor) {
	if (typeof executor !== 'function') {
		throw Error('实例 Promise 对象操作错误');
	}
	this._state = 'pending';
	this._value = undefined;
	this.onResolvedCallback = [];
	this.onRejectedCallback = [];

	try {
		executor(Promise.resolve.bind(this), Promise.reject.bind(this))
	} catch (error) {
		Promise.reject.call(this, error);
	}
}

Promise.resolve = function(value) {
	var _self = this;

	setTimeout(function() {
		if (_self === Promise) {
			return new Promise(function(resolve, reject) {
				resolve(value);
			});
		}
		if (_self._state === 'pending') {
			_self._state = 'resolved';
			_self._value = value;
			for (var i = 0; i < _self.onResolvedCallback.length; i++) {
				_self.onResolvedCallback[i]();
			}
		}
	})
}

Promise.reject = function(value) {
	var _self = this;

	setTimeout(function() {
		if (_self === Promise) {
			return new Promise(function(resolve, reject) {
				reject(value);
			});
		}
		if (_self._state === 'pending') {
			_self._state = 'rejected';
			_self._value = value;
			for (var i = 0; i < _self.onRejectedCallback.length; i++) {
				_self.onRejectedCallback[i]();
			}
		}
	})
}

Promise.prototype.then = function(resCallback, rejCallback) {
	var _self = this;

	resCallback = typeof resCallback === 'function' ? resCallback : function(value) {return value};
	resCallback = typeof resCallback === 'function' ? resCallback : function(value) {return value};
	if (this._state === 'resolved') {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				try {
					var x = resCallback(_self._value);
					if (x instanceof Promise) {
						x.then(resolve, reject);
					} else {
						resolve(x);
					}
				} catch (error) {
					reject(error);
				}
			})
		});
	}

	if (this._state === 'rejected') {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				try {
					var x = rejCallback(_self._value);
					if (x instanceof Promise) {
						x.then(resolve, reject);
					} else {
						resolve(x);
					}
				} catch (error) {
					reject(error);
				}
			})
		});
	}

	// 当执行异步函数的时候，执行 then 的时候结果还未返回，此时 state 为 pending，将 then 的处理函数存下 
	if (this._state === 'pending') {
		return new Promise(function(resolve, reject) {
			_self.onResolvedCallback.push(function() {
				try {
					var x = resCallback(_self._value);
					if (x instanceof Promise) {
						x.then(resolve, reject);
					}
				} catch (error) {
					reject(error)
				}
			});
			_self.onRejectedCallback.push(function() {
				try {
					var x = rejCallback(_self._value);
					if (x instanceof Promise) {
						x.then(resolve, reject);
					}
				} catch (error) {
					reject(error);
				}
			})
		})
	}
}

Promise.prototype.catch = function(cb) {
	return this.then(null, cb);
}

```

