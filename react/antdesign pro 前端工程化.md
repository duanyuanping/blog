前端工程化有：

一切能工提供前端工作效率、增强前端程序稳定的都能够称作前端工程化：

- 模块化
  - js 模块化
  - css 模块化
  - 资源模块化
- 组件化
- 规范化
- 稳定性
- 自动化
  - 自动化构建
  - 自动化部署
  - 自动化检测
  - 自动化测试
  - 声明式编程

antdesign pro 如何实现前端工程化的

## 模块化

### js 模块化

#### 模块调用方式

antdesign pro 使用的是 es6 中提供的模块导出和引入的方式（export/import）

使用 es6 模块语法需要配置 webpack 中的 babel-loader 以及 .babelrc 文件中的 presets 数组中添加 @babel/preset-env 来将 es6 转化成 es5 ，这样才能兼容低版本的浏览器。

#### pro 提供的一些通用模块

pro 提供了一个专门有一个 utils 文件来存放一些可重用的工具函数。

其中 request.js 文件，这个文件主要用于发出网络请求、根据请求方式来修改统一请求参数、添加或修改多个请求的参数（比如用户登录状态）、对网络请求结果进行统一处理（4、5开头的状态码统一就行处理、业务中单独定义的一些错误等等）

还有一些数据处理和鉴别的工具 utils.js 文件

### css 模块化

#### 样式分块

默认使用 less 预加载器来写样式，给每一个页面单独甚至每一个组件来单独写样式。

#### 解决样式覆盖

这一块代码大多来源于 http://www.ruanyifeng.com/blog/2016/06/css_modules.html

默认开启 css modules 功能，使用局部作用域来防止 class 重复，通过 hash 来给元素命名，使元素的 class 名不同，这样来消除不经意间修改到其他元素的样式，开启 css modules 的方式如下:

```
// webpack.config.js 中的 modules 中的 loaders
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader?modules',
  ],
}
```

如果需要使用全局作用域来对样式进行覆盖可以使用 :global(.className) 来声明全局规则，这样  class 就不会被编译成 hash 字符串了

定制 hash 名字：

````
{
  test: /\.css$/,
  use: [
    'style-loader',
    // arr 是将路径处理过后的数组，localName 是样式文件名
    'css-loader?modules&localIdentName=`antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-')',
  ],
}
````

class 组合：

```
// 编译前写的内容
.className {
  background-color: blue;
}

.title {
  composes: className;
  color: red;
}


import React from 'react';
import style from './App.css';

export default () => {
  return (
    <h1 className={style.title}>
      Hello World
    </h1>
  );
};

// 编译后的内容
._2DHwuiHWMnKTOYG45T0x34 {
  color: red;
}

._10B-buq6_BEOTOl9urIjf8 {
  background-color: blue;
}

<h1 class="_2DHwuiHWMnKTOYG45T0x34 _10B-buq6_BEOTOl9urIjf8">
```

### 资源模块化

使用 webpack 将 css 和 其他文件资源都统一打包到 js 文件中，这样在代码迁移的时候不用忙于处理图片合并和修改路径等工作。

这一切还依靠于 loader，来加载并解析资源文件。

## 组件化

pro 遵循组件化的思想（分治思想），将一个页面分成许多小型的组件，我们只需要先将组件开发完成，然后将组件拼接起来就能够完成一个页面的开发。

组件开发的时候我们可以将 html + css + js 放在一个文件下，相互引用，然后抛出组件接口就完成一个组件。

antdesign pro 依赖于 antdesign UI 库。开发人员不需要消耗大量的时间来完成一些小组件的封装，antdesign 中大量的组件足以提供开发者平时业务的需求。

开发过程中可以将 antdesign 提供的一些小型的组件封装成一个大型的组件，然后放入 components 文件中，这样就可以在多个页面中重复使用自己封装的组件。

## 规范化

### 目录结构规范化

pro 中规定了 config 文件为基本配置文件，mock 文件为模拟数据文件

src 文件中的 components 文件为用户自己封装的组件的文件，page 为页面文件，layout 为框架布局文件，models 为数据中心，services 为请求服务的地址...

### 编码规范化

使用 eslint 代码格式检测工具，能够规范团队开发时候的代码格式，并且如果 eslint 不通过就不允许提交到代码仓库中

### 开发文档规范

pro 提供了一套完整的开发文档（https://pro.ant.design/docs/getting-started-cn），使用者可以很快的熟悉开发流程。以及 antdesign 组件库中每一个组件都有一个文档，来告诉用户如何使用

## 自动化





学习地址:

[前端工程化](https://www.zhihu.com/question/24558375/answer/139920107)

[css modules-阮一峰](http://www.ruanyifeng.com/blog/2016/06/css_modules.html)