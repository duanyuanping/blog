# 浅析 react 中的 createElement API
----
## 简述

本文使用的是 `create-react-app` 初始工具，初始出来的项目  

![image](http://pf7iamiw1.bkt.clouddn.com/Snipaste_2018-09-17_23-55-13.png)  

上面展示是还没有被 babel 编译的代码。在运行的时，会被 babel 自动编译成下面的样子。

![image](http://pf7iamiw1.bkt.clouddn.com/Snipaste_2018-09-18_00-22-03.png)

今天我将简单解析一下关于 `React.createElement` 的源码。

## 封装结构
`React.createElement` 实际在源码中调用的顺序如下展示中的：

- React.createElement
    - createElementWithValidation
        - createElement
            - ReactElement

## 接受的参数
```
function createElement(type, config, children) { ... }
```
下面将简要介绍 createElement 的命名参数
- type：是元素或组件的名字。例如前面的 Hello 组件由于它是以首字母大写展现的，所以 babel 在编译的时认为它是一个组件，在这里 type 就是 Hello 函数；对于 h1 和 p 他们开头都是小写字母，babel 编译时就将他们编译成元素的展现形式，所以 type 分别是 'h1'、'p' 字符串。
- config：传入得 props，例如 h1 元素中被编译后的 `{ style: { color: 'red' }, className: 'head' }` 对象
- children：子节点

前面已经将 `React.createElement` 封装结构展示出来，由于 `ReactElement` 函数是用来将 `createElement` 函数获取到的一些列值得再处理，所以下面我们将先看 `CreateElement`。

## createElement
其实我们调用的 `React.createElement` API 时最主要步骤就是这个函数。`createElement` 主要干了下面三件事：1）将命名参数 config 的值转入 props 参数中；2）将 children 赋值给 props.children；3）将 type 的 defaultProps 属性放入 props 属性中

### config 的值转入 props
```
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

function createElement(type, config, children) {
    ......
    
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
    
    ......
}
```
如上面源码所展示的，会将 config 中除 `key、ref、__self、__source` 以外的其他属性都将赋值给 props

### children 赋值给 props.children
```
function createElement(type, config, children) {
    ......
    
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
    props.children = children;
    } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
    }
    
    ......
}
```
在给 `props.children` 赋值前需要对子节点的数量就行判断，在源码中 createElement 的命名参数 type 和 config 都不属于子节点的范畴。如果子节点数量为 1 就直接将 children 赋值给 `props.children`；如果子节点的数量大于 1 那就需要遍历 arguments 去获取所有的子节点，然后将子节点存入 `props.children` 数组中；当然如果子节点数量为 0 那 props 就不需要 children 属性了。

### defaultProps 属性放入 props 属性中
```
function createElement(type, config, children) {
  ......
    
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  
  ......
}
```
上面这段代码做的工作如下：如果 type 和 type.defaultProps 都存在，就去遍历 `type.defaultProps` 的属性，如果 props 中没有与 `type.defaultProps` 中同名的属性，那就直接在 props 中创建并赋值 `type.defaultProps` 的同名属性，如果有同名的就直接舍弃 `type.defaultProps` 中的这个属性。

经过 `createElement` 处理后的 props 的值这里拿 `<h1 style={{ color: 'red' }} className="test">This is a test</h1>` 这段代码做展示，如下图：

![image](http://pf7iamiw1.bkt.clouddn.com/Snipaste_2018-09-18_15-33-42.png)

### ReactElement
`ReactElement` 没什么可看的就是将 `createElement` 函数中的一些变量组合成一个对象然后 return ，实在好奇的可以自己去看下。

### createElementWithValidation
当我们调用 `React.createElement` 时，实际直接运行的就是这个函数了，下面将讲解这个函数干了些什么。

- 首先去判定 type 是否是有效的
- 如果无效就抛出警告，然后继续运行 `createElement` 及其后面的代码
- 运行`createElement` 及其后面的代码
- 然后判断 type 是否是 `Fragment` 组件
    - 如果是 `Fragment` 组件就判断它的 props 是否含有 'children' 和 'key' 以外的属性
        - 如果有就抛出警告
    - 如果不是 `Fragment`
        - 。。。（后面补充）

最终将整个运行结果返回给调用 `React.createElement` 的地方。

## 输出结果
经过上面一系列的调用之后 `React.createElment` 会输出类似如下的对象：

![image](http://pf7iamiw1.bkt.clouddn.com/Snipaste_2018-09-18_00-17-57.png)