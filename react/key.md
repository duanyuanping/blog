Key 可以在 DOM 中的某些元素被增加或删除的时候帮助 react 识别哪些元素发生了变化

```
<ul>
	<li>Com1</li>
</ul>

// 向列表元素前面加上 Com2

<ul>
	<li>Com2</li>
	<li>Com1</li>
</ul>
```

上面情况实际只是在 Com1 前面添加了一个 Com2，如果我们不使用 key 值来标识，react 就会将 Com1 卸载后重新渲染

```
import React, { Component } from 'react';
import Com1 from './Com1';
import Com2 from './Com2';

export default class extends Component {
  state = {
    com: [
      {
        key: 1,
        com: Com1
      }
    ]
  }

  handleClick = () => {
    this.setState({
      com: [
        {
          key: 2,
          com: Com2
        },
        ...this.state.com
      ]
    })
  }

  render() {
    return (
      <div>
        {this.state.com.map(({com: Com, key}) => <Com key={key}></Com>)}
        <button onClick={this.handleClick}>点击</button>
      </div>
    )
  }
}

```

```
// Com1 和 Com2 内容差不多
import React, { Component } from 'react';

export default class extends Component {
  componentDidMount() {
    console.log('Com1 did mount');
  }

  componentWillUnmount() {
    console.log('Com1 will unmount')
  }

  render() {
    return <div>Com1</div>
  }
}
```

我们使用 key 之后，Com1 并不会被卸载但是他会重新 render（因为父组件更新了的原因，子组件会调用更新，这里可以使用 PureComponent 来让 Com1 不更新）

