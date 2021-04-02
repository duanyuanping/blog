# js 深拷贝

本篇将展示一下内容：

1. 浅拷贝
2. JSON.parse、JSON.stringify 实现深拷贝
3. 递归实现深拷贝

## 浅拷贝

对象的浅拷贝是指只拷贝对象的最外层的属性，至于原对象的属性值类型是基本类型还是引用类型并不管，这里会直接将原对象的最外层属性值赋给新生成的对象。这里基本数据类型是直接将值赋给对象的属性，而引用类型是将一个能够指向对象的指针赋给对象属性，浅拷贝会出现下面的情况：

```
const oldObj = {
  a: 1,
  b: { title: 'hello' },
}
// Object.assign 函数是一个浅拷贝的函数
const newObj = Object.assign(oldObj);

oldObj.b.title = 'word';

console.log(oldObj.b); // { title: "word" }
console.log(newObj.b); // { title: "word" }
// 这里 newObj 对象中的 b 属性也改变的原因是 oldObj.b 和 newObj.b 指向的是同一个对象
```

## JSON.parse & JSON.stringify
将对象序列化和反序列化，如下：

```
const oldObj = {
  a: 1,
  b: { title: 'hello' },
}
const newObj = JSON.parse(JSON.stringify(oldObj));

oldObj.b.title = 'word';

console.log(oldObj.b); // { title: "word" }
console.log(newObj.b); // { title: "hello" }
// 这样就可以实现普通对象的深克隆
```

但是使用这个方法还是有很多弊端，如下：

- 不能实现函数的克隆

```
const oldObj = {
  a: function() {}
}
const newObj = JSON.parse(JSON.stringify(oldObj));

console.log(oldObj.a); // f () {}
console.log(newObj.a); // undefined
```

- 如果原对象是由除 Object 构造函数实例出来的对象，克隆得到的对象的原型链上只会有 Object.prototype 和 null

```
class Person {
  constructor(name) {
    this.name = name;
  }
  tel() {
    console.log(this.name)
  }
}
const person1 = new Person('duan')
const person2 = JSON.parse(JSON.stringify(person1));

console.log(person1.__proto__ === Person.prototype); // true
console.log(person2.__proto__ === Person.prototype, person2.__proto__ === Object.prototype); // false true
```

- 原对象有循环引用时会报错

```
const oldObj = {};
oldObj.a = oldObj;
const newObj = JSON.parse(JSON.stringify(oldObj));
// Uncaught TypeError: Converting circular structure to JSON

console.log(oldObj);
console.log(newObj);
```

- 稀疏数组（有值为 undefined 的子元素）、正则、Set、Map、Date、Promise 克隆时都是有问题的

```
const oldObj = {
  a: [undefined, 1],
  b: /^8/g,
  c: new Set([8]),
  d: new Map([[{title: 'hello'}, 233]]),
  e: new Date(),
  f: Promise.resolve(233)
};
const newObj = JSON.parse(JSON.stringify(oldObj));

console.log(oldObj);
//{
//  a: (2) [undefined, 1],
//  b: /^8/g,
//  c: Set(1) {8},
//  d: Map(1) {{…} => 233},
//  e: Fri Dec 14 2018 17:34:39 GMT+0800 (中国标准时间) {},
//  f: Promise {<resolved>: 233}
//}
console.log(newObj);
//{
//  a: (2) [null, 1],
//  b: {},
//  c: {},
//  d: {},
//  e: "2018-12-14T09:34:39.692Z",
//  f: {}
//}
```

## 递归

这里我们使用递归来解决上面深克隆方法的部分不足（下面将不展示函数和 Promise 对象的深克隆）。

```js
const isType = (obj, type) => {
  if (typeof obj !== 'object') return false;
  const typeString = Object.prototype.toString.call(obj);
  let flag;

  switch (type) {
    case 'Array':
      flag = typeString === '[object Array]';
      break;
    case 'Date':
      flag = typeString === '[object Date]';
      break;
    case 'RegExp':
      flag = typeString === '[object RegExp]';
      break;
    case 'Set':
      flag = typeString === '[object Set]';
      break;
    case 'Map':
      flag = typeString === '[object Map]';
    default:
      flag = false;
  }
  return flag;
};

const getRegExp = re => {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};

function cloneDepth(object) {
  const parents = [];
  const children = [];

  function _clone(parent) {
    if (parent === null) return parent;
    if (typeof parent !== 'object') return parent;
    
    let child;
    // 处理各种特殊数据
    if (isType(parent, 'Array')){
      child = [];
    } else if (isType(parent, 'Date')) {
      child = new Date(parent.now());
    } else if (isType(parent, 'RegExp')) {
      child = new RegExp(parent.source, getRegExp(parent))
    } else if (isType(parent, 'Map')) {
      child = new Map(parent);
    } else if (isType(parent, 'Set')) {
      child = new Set(parent);
    } else {
      proto = Object.getPrototypeOf(parent);
      child = Object.create(proto);
    }

    // 处理循环引用
    const parentIndex = parents.indexOf(parent);
    if (~parentIndex) {
      return children[parentIndex];
    };

    parents.push(parent);
    children.push(child);

    for (let key of Object.keys(parent)) {
      child[key] = _clone(parent[key]);
    }
    return child;
  }

  return _clone(object);
}

module.exports = cloneDepth;
```

借用学习的网站里面的栗子：

```
class Person {
  constructor(name) {
    this.name = name;
  }
}

const Messi = new Person('Messi');

const say = () => {
  console.log('hi');
}

const oldObj = {
  a: say,
  c: new RegExp('ab+c', 'i'),
  d: Messi,
  e: new Set([1, 2]),
  f: new Map([[[], 1]]),
  p: Promise.resolve({name: duan})
};
oldObj.b = oldObj;

const newObj = clone(oldObj);

console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
console.log(newObj.b == oldObj.b); // false
console.log(newObj.c, oldObj.c);// /ab+c/i /ab+c/i
console.log(newObj.d.constructor, oldObj.d.constructor);// [Function: person] [Function: person]
console.log(newObj.e, oldObj.e, newObj.e == oldObj.e);// Set(2) {1, 2} Set(2) {1, 2} false
console.log(newObj.f, oldObj.f, newObj.f == oldObj.f);// Map(1) {Array(0) => 1} Map(1) {Array(0) => 1} false
```

## 学习资源

[面试官:请你实现一个深克隆](https://juejin.im/post/5abb55ee6fb9a028e33b7e0a)