## 不同

PureComponent 和 Component 这两个类几乎是一样的，不同的点在于判断组件是否更新上面有一些出入。

PureComponent 通过浅比较 state 对象和 props 对象中的属性值是否改变（后面一 state 来说明），来判断是否需要更新组件。而对于 Component 组件来说就会一股脑的调用 render。他们出现这样的差别的原因在于 PureComponent 对 shouldComponentUpdate() 进行了实现，而对于 Component 者中的 scu（只取了首字母）函数需要我们自己写判断。

## 基本类型数据

在下面这段代码中除了第一次打印的 render 外，我们不管怎么点击按钮都只会打印一次 render 字符串，这里由于一直将 bol 设置成 true 在第二次及其之后 bol 的值就一直没有。如果我们把 PureComponent 改成 Component 后，我们每次按钮，控制台都会打印出 render。

```
import React, { PureComponent, Component } from 'react';

export default class extends PureComponent{
  state = {
    bol: false
  }

  handleClick = () => {
    this.setState({bol: true})
  };
  render() {
    console.log('render');
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        <div>{this.state.bol.toString()}</div>
      </div>
    );
  }
}
```

## 引用类型数据

下面的例子之后在首次渲染的时候才会打印 render 字符串，其他时间不管我们怎么点击都不会更新。

```
import React, { PureComponent, Component } from 'react';

export default class extends PureComponent{
  state = {
    arr: [1]
  }

  handleClick = () => {
    const { arr } = this.state;
    arr.push(1)
    this.setState({ arr })
  };
  render() {
    console.log('render');
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        <div>{this.state.arr.toString()}</div>
      </div>
    );
  }
}
```

## 父子组价更新关系

如果父组件继承的是 PureComponent 类，不管子组件声明继承的什么类，只要父组件不重新渲染，子组件就永远不会重新渲染

当父组件继承 Component，如果子组件继承的是 Component，那么，只要父组件一更新，子组件就会跟着一起更新

当父组件继承 Component，如果子组件继承的是 PureComponent，父组件更新的时候，子组件会去浅比较 props 对象中的属性值是否发生改变。

最后：如果组件的 state 或者 props 中的属性每次都改变了的，那就不要用 PureComponent 了，因为使用这个多了浅比较这一环节，反而会降低性能