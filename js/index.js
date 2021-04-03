const a = require('./test');

setTimeout(() => a.catch(err => console.log('22', err.stack)))