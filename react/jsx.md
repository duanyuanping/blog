将 HTML 模板直接嵌入到 JS 代码里面，但是 JS 不支持这种包含 HTML 的语法，所以需要通过工具将 JSX 编译输出成 JS 代码才能使用。

使用 jsx 时，我们需要使用 babel（@babel/preset-react） 来讲 jsx 代码转换成 js 代码，转换后的 jsx 会调用 React.createElement 函数，所以我们需要在每个组件文件中引入 React 组件。

在 jsx 中我们需要将组件名首字母大写，而元素则需要小写，这样做目的是方便 babel 识别哪些是组件哪些是元素