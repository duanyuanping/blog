const cloneDepth = require('./copy-depth');

const origin = {
  name: 'walter',
  age: 23,
  other: {
    com: 'tencent',
  },
};

origin.test = origin;

const cloneData = cloneDepth(origin)

console.log(cloneData);