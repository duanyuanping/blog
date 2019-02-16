## setState(updateState, callback)

- updateState
  - 可以是对象，如：{ num: 3 }
  - 可以是函数，如: (prevState , props)=> { console.log(prevState);  return { num: 3 }}
    - 当为函数的时候接受的第一个参数，该参数是更新前的 state 值，return 的对象会拿来更新 state
    - props：为父组件传入的状态
- callback
  - 函数，当 state 更新成功后就会调用这个函数

注意：setState 是异步更新 state。指的是：当调用 setState 的时候不一定会马上更新组件中的 state。

```
state = {
  num: 0,
}
componentDidMount() {
    for ( let i = 0; i < 100; i++ ) {
      this.setState({ num: i });
      console.log(this.state.num);
    }
  }
```

上面代码打印出来的数据全是 0，react 会等到 for 同步代码执行完以后才更新 state。

其实有的类 react 库（preact）实现的是同步更新 state，但是异步更新页面。

这两种实现的目的是为了防止同一时间多次修改 state，导致同一时间多次更新页面，导致性能下降。

下面将展示另一个问题：

```
state = {
  value: 0
}

componentDidMount() {
  this.setState({
    value: this.state.value + 1
  })
  this.setState({
    value: this.state.value + 1
  })
}
```

实际中调用 addValue 函数后，state 的值并不会变为 2 [原因：当 componentDidMount 中调用 setState 时，控制是否马上更新的 isBatchingUpdates 参数值为 true 表示现在正在执行更新组件操作（处于 react的生命周期中），所以此时调用 setState 只能够将新的 state 放入 dirtyComponent 队列中，等到 isBatchingUpdates 为 false（即 batchedUpdates 事务 close 阶段） 的时候才来更新 dirtyComponent 队列中的 state]

想要变成 2 ，可以有以下两种方法：

```
componentDidMount() {
  this.setState((prevState,props)=>({
    value: preState.value + 1
  }))

  this.setState((prevState,props)=>({
    value: preState.value + 1
  }))
}
```

当从 dirtyComponent 更新队列里取出的 state 的值为函数时就会调用此函数并向函数传入更新前的 state 和当前 props，prevState 这个参数是

```
componentDidMount() {
  setTimeout(()=>{
    this.setState({
      value: this.state.value + 1
    });
    console.log(this.state.value); // 1
    this.setState({
      value: this.state.value + 1
    });
  },0)
}
```

在 componentDidMount 中异步调用 setState，这样就可以在 isBatchingUpdates 为 false 时调用 setState 来对组件进行更新。

还有就是事件合成也是会调用 batchedUpdates 函数（前面也是调用这个函数去修改 isBatchingUpdates 的值），这个函数内部会修改 isBatchingUpdates 成 true，所以下面修改 state 也会是异步的：

```
// value 初始值为 0
...
handleChilck() {
  this.setState({ value: this.state.value + 1});
  console.log(this.state.value); // 0
}
render() {
  return <div onClick={this.handleClick.bind(this)}>hello</div>
}
...
```

1. 在组件生命周期中或者react事件绑定中，setState是通过异步更新的。 

2. 在延时的回调或者原生事件绑定的回调中调用setState不一定是异步的。



[react 中的 setState 技术内幕](https://github.com/MrErHu/blog/issues/20)

[React中setState真的是异步的吗](https://juejin.im/post/5ac1aaad6fb9a028d444bb87)



