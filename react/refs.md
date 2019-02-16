以下内容来自 https://react.docschina.org/docs/refs-and-the-dom.html，如果误入请访问该链接中的内容

下面是几个适合使用 refs 的情况：

- 处理焦点、文本选择或媒体控制。
- 触发强制动画。
- 集成第三方 DOM 库

```
import React, { Component } from 'react';

export default class extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    this.textInput.current.focus(); // input 框获取焦点
  }

  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />

          
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

为组件添加 ref，组件必须是使用 class 来声明的组件（此时的 ref.current 就是这个组件的实例），函数式组件因为不会别实例化所以访问不到组件

```
// 回调创建 ref
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

		// 这个函数用于回调创建 ref
    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    this.focusTextInput();
  }

  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

````
// ref 传递，将父组件中的 ref 作为一个 props 传入子组件
class Sub extends Component{
    render(){
        const {forwardRef} = this.props;
        return <div ref={forwardRef}/>
    }
}
class Sup extends Component{
    subRef = React.createRef();
    render(){
        return <Sub forwardRef={this.subRef}/>
    }
}
````





