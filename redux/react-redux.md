下面是模拟实现 react-redux 库中的 Provider 组件和 connect 函数

```
// context.js
import React from 'react';

export default React.createContext({})
```

````
// Provider.js
import React, { Component } from 'react';
import context from './context';

export default class extends Component {
  render() {
    return (
      <context.Provider value={this.props.store}>
        {this.props.children}
      </context.Provider>
    )
  }
}
````

```
// connect.js
import React from 'react';
import context from './context';

export default (mapStateToProps, mapDispatchToProps) => Com => {
  class WrapComponent extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.getOwnState();
    }

    getOwnState = () => {
      return this.props.store.getState()
    }

    onChange = () => {
      this.setState(this.getOwnState())
    }

    componentDidMount() {
      this.props.store.subscribe(this.onChange)
    }

    componentWillUnmount() {
      this.props.store.unsubscribe(this.onChange)
    }

    render() {
      const { store, ...otherProps } = this.props;
      const state = mapStateToProps(this.state, otherProps);
      const dispatch = mapDispatchToProps(store.dispatch, otherProps)
      
      return <Com {...otherProps} {...state} {...dispatch}></Com>
    }
  }

  return props => {
    return (
      <context.Consumer>
        {
          store => <WrapComponent store={store} {...props}/>
        }
      </context.Consumer>
    )
  }
}
```

