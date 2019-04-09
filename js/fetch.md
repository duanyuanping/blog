# fetch

## 简述

fetch api 使用来替换现有的 XHR 来实现前端网络请求，这样我们在不用加载任何插件或者封装 ajax 请求对象的情况下，就能够完成网络请求。并且调用 fetch 函数会在请求返回结果时返回一个 promise 对象，我们可以使用 es6/7 中的 Promise、generator/yield、async/await 来读取网络请求的结果。

## 注意

在使用 fetch 之前需要了解一下的几个值得注意的点：

- 使用 fetch 发起网络请求，只有在网络故障或者请求被阻止这两种情况下返回的 promise 对象状态是 reject，其他不管响应的状态码 status 为多少返回的 promise 对象状态都为 fulfille
- fetch 请求接口的时候默认是不会发送 cookie 的，如果想要发送 cookie 就需要设置 credentials 属性值为 `include` 或者 `same-origin` 分别表示总是发送 cookie 和 只有在同源的情况下才发送 cookie，credentials 属性还有另外一个值为 `omit` 表示不发送 cookie
- 使用 fetch 请求接口传递 json 数据时需要在 headers 中写入 `'content-type': 'application/json'`，并且 post 的 body 不能为 json 对象，在传送 json 数据前需要将 json 数据转成字符串

## 简单使用

下面有一个请求登录接口的例子：

```
const headers = new Headers({
  'Content-Type': 'application/json'
});
fetch('http://localhost:7010/api/login', {
  method: 'post',
  body: JSON.stringify({email: 'admin@qq.com', password: '888888'}),
  headers,
  credentials: 'same-origin'
})
.catch(error => {
  console.log('请求错误', error)
})
.then(res => res.headers.get('content-type') === 'application/json; charset=utf-8' && res.json())
.catch(error => error)
.then(data => {
  console.log(data)
})
```

async/await 用法：

```
// 使用 async 处理异步，如果 fetch 返回的 promise 的状态是 reject 就会被外部的 catch 捕捉
async test() {
  try {
    const headers = new Headers({...});
    const res = await fetch(url, {...});
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.log(`请求出错：${err}`);
  }
}
```

## Headers 

我们可以通过 Headers 构造函数来创建一个 headers 对象，如上面例子中的代码：

```
const headers = new Headers({
  'Content-Type': 'application/json',
  'test': '1111111111'
});
// 或者写成下面的样子，两种都是可以的
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('test', '1111111111');
```

![1539867202186](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539867202186.png)

其中我们调用 headers 对象中的 get 函数来获取 headers 中的某个属性的值:

```
headers.get('Content-Type'); // "application/json"
```

如果后面需要修改 headers 中的属性值，可以调用 headers 对象中的 set 函数来进行修改：

```
headers.set('test', '22222222222');
```

![1539867225730](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/1539867225730.png)



## Requset

我们可以通过 Request 构造函数来创建一个请求对象，然后作为参数传给 fetch 函数：

```
const headers = new Headers({
  'Content-Type': 'application/json'
});
const init = {
  method: 'post',
  body: JSON.stringify({email: 'admin@qq.com', password: '888888'}),
  headers,
  credentials: 'same-origin'
};
const request = new Request('http://localhost:7010/api/login', init);

fetch(request)
.catch(error...)
...
```

`Request()` 和 `fetch()` 接受同样的参数。你甚至可以传入一个已存在的 request 对象来创造一个拷贝（mdn 中的描述和代码）：

```
var anotherRequest = new Request(myRequest,myInit);
```

## Response

”只有在[`ServiceWorkers`](https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorker_API)中才真正有用“--来自mdn，现在我还不知道怎么使用。想了解的可以前往 [Response 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch#Response_%E5%AF%B9%E8%B1%A1) 中学习如何使用。

## 尾语

关于 fetch 不管请求响应的状态码以 2 开头还是 4 或者 5 开头，返回的 promise 对象的状态都为 fulfilled 的情况，我们在实际业务中使用此 api 的时候还是需要对 fetch 进行封装后才能使用。







