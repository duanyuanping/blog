react-router中提供了HashRouter和BrowserRouter两种，其中还提供了Link（修改路由）和Router（根据路由选择显示的组件）。

react中一般有下面两种使用方法：
1. HashRouter、Link、Router  
```js
<HashRouter>
  <Link to='/home'>home</Link>
  <Link to='/about'>about</Link>
  <Route path='/home' render={()=><div>home</div>}></Route>
  <Route path='/about' render={()=><div>about</div>}></Route>
</HashRouter>
```

2. BroserRouter、Link、Router  
```js
<BrowserRouter>
  <Link to='/home'>home</Link>
  <Link to='/about'>about</Link>
  <Route path='/home' render={()=><div>home</div>}></Route>
  <Route path='/about' render={()=><div>about</div>}></Route>
</BrowserRouter>
```

## HashRouter路由跳转实现
当url中的hash发生变化时会触发window中的hashchange事件，我们可以通过location.hash获取到当前url中的hash值。
```js
import React from 'react';

const { Provider, Consumer } = React.createContext();

export class HashRouter extends React.Component {
  state = {
    currentPath: this.getCurrentPath()
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.onChangeView);
  }

  componentWillUnMount() {
    window.removeEventListener('hashchange', this.onChangeView);
  }

  onChangeView = () => {
    this.setState({
      currentPath: this.getCurrentPath(),
    });
  }

  // 获取url中的hash
  getCurrentPath = () => {
    return window.location.hash;
  }

  render() {
    return (
      <Provider value={{ currentPath: this.state.currentPath }}>
        {
          React.Children.map(this.props.children, function (child) {
              return child;
          })
        }
      </Provider>
    )
  }
}

export class Link extends React.Component {
  render() {
    return (
      <a href={`#${this.props.to}`} {...this.props} />
    );
  }
}

export class Route extends React.Component {
  render() {
    return (
      <Consumer>
        {
          currentPath => currentPath === this.props.path && render()
        }
      </Consumer>
    )
  }
}
```
## BrowserRouter路由跳转实现
借助window.history中的pushState，该函数和replaceState在修改url后，不会造成页面刷新。当调用pushState修改url以后，会触发window的popstate事件。同时我们可以通过location.pathname来获取最新的url中的路径。

```js
import React from 'react';

const { Provider, Consumer } = React.createContext();

export class HashRouter extends React.Component {
  state = {
    currentPath: this.getCurrentPath()
  }

  componentDidMount() {
    window.addEventListener('popstate', this.onChangeView);
  }

  componentWillUnMount() {
    window.removeEventListener('popstate', this.onChangeView);
  }

  onChangeView = () => {
    this.setState({
      currentPath: this.getCurrentPath(),
    });
  }

  // 获取url中的pathname
  getCurrentPath = () => {
    return window.location.pathname;
  }

  render() {
    return (
      <Provider value={{ currentPath: this.state.currentPath }}>
        {
          React.Children.map(this.props.children, function (child) {
              return child;
          })
        }
      </Provider>
    )
  }
}

export class Link extends React.Component {
  handleClick = (e) => {
    e.preventDefault();

    window.history.pushState(null, '', this.props.to);
  }

  render() {
    return (
      <a
        {...this.props}
        onClick={this.handleClick}
      />
    );
  }
}

export class Route extends React.Component {
  render() {
    return (
      <Consumer>
        {
          currentPath => currentPath === this.props.path && render()
        }
      </Consumer>
    )
  }
}
```