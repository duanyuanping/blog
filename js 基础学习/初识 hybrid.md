# 初识 hybrid

## 简述

本篇展示的内容仅仅只是对 hybrid 的了解，后面会从 hybrid 是什么、hybrid 上线更新、hybrid 和 h5 的区别、js 与客户端通信这几个方面来简单介绍下。

## 什么是 hybrid

混合应用开发，它是由手机客户端和前端混合开发的一类技术。hybrid 实现以 客户端 webview 这项能力为基石。hybrid 页面包括客户端和前端两种内容。

webview 是是客户端中的一种能力，即客户端能够使用 webview 这一类的 api 来实现在客户端嵌入一个小型的浏览器，用来加载前端页面。如下图展示的图片，如果该内容使用的 hybrid 技术：

![1540176671109](http://p86utdi99.bkt.clouddn.com/1540176671109.png)

### 资源加载

#### 前端资源加载：

客户端会到服务器端将前端页面缓存到本地，等到要使用前端页面的使用就使用 file 协议来加载前端资源，加载的方式如下：

```
file:///C:/Workspace/test/public/index.html
```

上面的那行代码就是通过 file 协议来对本地资源的加载。

盗一张别人的图

![1540178859261](http://p86utdi99.bkt.clouddn.com/1540178859261.png)

#### 数据加载

如果上面展示的新闻详细页使用的 hybrid 技术，那请求这些新闻内容数据就会放在前端页面渲染之前，可能是用户滑动到显示这条新闻列表的时候，也有可能是在用户才点击这条新闻还没有进入新闻详细的时候，这样做的目的就是尽可能的加快前端页面的展示。

### 为什么要用 hybrid

由于客户端每次更新都需要手机厂商对客户端进行审核，这当中会浪费大量的时间。由于前端不能直接调起手机底层的功能，比如手机定位、录音什么的，所以厂商就不需要对前端功能进行审核。所以如果像上面这种新闻详细页可能会经常更新样式的页面就使用前端页面。所以对于那些开发迭代比较快的页面就可以使用 hybrid 技术。

## hybrid 更新

打开客户端的时候，客户端会带着本地前端资源的版本去请求服务器，让服务器判断 server 端存放的前端资源是否有更新，如果没有可更新的内容就什么都不用做，当有前端页面需要更新的时候，客户端就会请求 server 端，将最新的前端页面的压缩资源下载下来（server 端存放的前端页面资源是需要压缩的，不然消耗容量），然后本地解压，以备后面需要的时候直接提取使用。

下图还是盗用别人的图：

![1540182732858](http://p86utdi99.bkt.clouddn.com/1540182732858.png)

注：上面的是 server 端的资源，下面的一列是各个用户手机中的客户端。图里面的  v 是时间戳（版本号）。

## hybrid 与 h5 的区别

- hybrid 的前端资源存放在本地，使用 file 协议来对资源进行加载；h5 前端资源在 server 端，使用 http(s) 协议进行加载
- hybrid 前端页面渲染所需的数据在页面资源加载前就已经获取到；h5 页面渲染所需的数据是页面渲染中使用 js 向服务器请求数据
- hybrid 开发难度更大，因为需要和客户端进行配合，但是这样 hybrid 页面在手机端的功能也就越高；h5 是嵌入客户端的前端页面，所以不需要客户端方面的配合，所以开发难度相对于 hybrid 来说较低。
- hybrid 适用于产品型的页面（会长久的存在，访问占比较多，迭代比较快），h5 使用于运营型的页面（像活动页面的那种，这次用了，后面就不用了）

hybrid 优点：

- 快速迭代，无需审核
- 页面加载快，用户不会感受到像 h5 那样的白屏

## js 与客户端通信

hybrid 中前端 js 和客户端通信的协议是 schema 协议，schema 协议是 Android 中页面内跳转的协议。前端 js 调用客户端自己定义的 schema 协议，来实现通信。下面展示一个封装后的 schema 的实例：

```
// invoke.js
// 调用客户端的 schema，可以用其他方法
const _createInvoke = schema => {
  const iframe = document.createElement('iframe');
  iframe.src = schema;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
}

const _invokeSteps = (action, data, callback) => {
  let schema = `app://path/${action}?`;
  for (const [key, val] of Object.entries(data)) {
    schema = `${schema}${key}=${val}&`;
  }

  const callbackName = undefind;
  if (typeof callback === 'string') {
    callbackName = callback;
  } else {
  	 callbackName = `${action}-${Date.now()}`;
  	 // 注意函数一定要写入全局，这样才能让客户端回调
  	 window[callbackName] = callback;
  }
  schema = `${schema}${callback}=${callbackName}`;
  
  _createIfram(schema);
}

const _invokeShare = (data, callback) => {
  _invokeSteps('share', data, callback);
}

const _invokeRecord = (data, callback) => {
  _invokeSteps('record', data, callback);
}

export default {
  share: _invokeShare,
  record: _invokeRecord,
}
```

```
// 调用客户端分享的 schema 
import invoke from invoke.js

// 客户端调用回调是调用的 js 全局中的函数
window.shareCall = (result) => {
  if (parseInt(result.errno) === 0) {
    // 成功回调
    console.log('success: share');
  } else {
    console.log(`error: share -- ${result.msg}`);
  }
}
// 因为上面的 invoke 做了封装，所以这里传入回调可以传入函数名也可以传入函数体
invoke.share({ title: '初识 hybrid', contant: '这是一门有趣的技术' }, 'shareCall');
```

注：invoke.js 不会在网络中传输，他会存放在客户端本地中，因为如果在网络中传输被其他带有恶意的用户抓包拿到，就会知道本客户端的 schema 定义，有一定安全隐患。