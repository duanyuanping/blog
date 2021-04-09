## setState(updateState，callback)

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

## setState异步更新问题
在组件生命周期中或者react事件绑定中，setState是通过异步更新的。
```js
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

```js
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
上面合成事件中setState也是异步更新state。

react中setState必然会触发组件更新（组件不实用sholdComponentUpdate），因此react中将setState设置成一个异步更新数据，这样可以将多次state更新合并成一次，然后只更新一次组件。

在 componentDidMount 中异步调用 setState，这样就可以在 isBatchingUpdates 为 false 时调用 setState 来对组件进行更新。  
实现同步更新state的方法：
1. setState第一个参数传入函数，获取上一个state值计
2. setState通过回调来读取最新的state。
3. 计时器回调或者原生事件回调中调用setState就可以实现setState同步更新

```js
componentDidMount() {
  this.setState((prevState,props)=>({
    value: preState.value + 1
  }))

  this.setState((prevState,props)=>({
    value: preState.value + 1
  }))
}
```

```js
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

- [react 中的 setState 技术内幕](https://github.com/MrErHu/blog/issues/20)
- [React中setState真的是异步的吗](https://juejin.im/post/5ac1aaad6fb9a028d444bb87)



