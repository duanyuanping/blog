const a = new Promise((_, rej) => resolve('hello'))

a.catch(err => console.log('11', err.stack))

module.exports = a;