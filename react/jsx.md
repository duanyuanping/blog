react中，我们可以像写react那样定义使用什么元素节点类型和传入的参数。但是js执行过程并不能识别jsx，因此项目中需要使用`@babel/preset-react`babel插件将项目中使用了jsx的地方改成js可以执行的语句。
```js
const title = <h1 className="title">Hello, world!</h1>;

// jsx转义后
const title = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, world!'
);
```
正因为经过转义后的jsx会调用`React.createElement`，所以在存在jsx代码的页面中需要添加`import React from 'react';`代码。
