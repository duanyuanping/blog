const MyPromise = require('./promise');

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('reject')
  }, 2000); 
})

promise
  .then(
    value => {
    console.log(1)
    console.log('resolve', value)
    return 'test'
  },
  reason => {
    console.log('then1', reason);

    throw new Error('11111')
  }
  )