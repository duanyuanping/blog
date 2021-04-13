# 动态请求jsbundle

## 直出过程
- 直出代码本地构建
  - 将rn jsbundle包构建出来（代码中有一个叫__STATE_PLACEHOLDER__的锚点，该锚点在页面渲染之前）
  - 直出代码中引用jsbundle文件，在构建直出代码过程中，将jsbulde内容写入到最终的构建结果中
  - 同时直出引用了一个Page对象（页面中包含数据请求和存储相关的store），在Page对象中有一个fetch函数，这个函数就是做一些首屏相关数据的请求工作
  - 借助腾讯云服务函数代码上传工具ngw，将直出服务部署到云服务上

- 直出服务请求
  - 初始Page对象，调用Page对象中的fetch函数，进行首屏数据请求的相关工作
  - 调用reduce中的store.getState获取reducer中的数据
  - 使用接口数据替换jsbundle中的锚点内容，替换完成以后，将数据返回
  - 客户端在获取到数据以后，会去解析渲染jsbundle
  - rn页面在请求首屏数据前会去检测__initialState是否存在可用的值，如果有就表示该jsbundle是直出成功得到的，就不会请求首屏数据；如果没有就表示是非直出或者直出失败，就会重新请求首屏数据

- 直出服务性能
  - 我们通过分析页面上报的数据，发现页面渲染两个最耗时的任务分别是jsbundle加载、首屏数据请求。通过cdn加载jsbundle，首屏渲染完耗时一般都在1600ms左右，而通过直出的方式，首屏渲染只需要1300ms左右，优化了差不多300ms。
  - 产生这种优化效果的主要原因在于，客户端在首页渲染的时候，会去加载多个相近的页面，导致客户端页面首屏数据加载出现网络资源竞争的情况。而服务端直出环境就要好很多，首屏数据请求差不多都能保持在较短的时间，因此，客户端从请求jsbundle资源到页面首屏数据渲染出来，直出的方式要比直接请求jsbundle资源的方式要快得多。

## 错误监控
### 语法错误
- `global.ErrorUtils.setGlobalHandler`：全局设置错误回调函数
- `global.ErrorUtils.getGlobalHandler`：获取全局错误回调函数

```js
const originErrorHandler = global.ErrorUtils.getGlobalHandler();

global.ErrorUtils.setGlobalHandler((error, isFatal) => {
  const errMes = `${error}\n${error.stack}`;

  // 执行之前设置的错误回调函数
  originErrorHandler.call(global.ErrorUtils, error, isFatal);
});
```

在进行下面的内容之前需要介绍下什么是单例模式。app只会初始一个容器，用来渲染所有的rn页面，被渲染过的页面会一直在该容器中运行，只有当app退出后，整个容器才会被释放。

单例容器下所有页面通用同一个global对象，后加载的页面，会重制前一个页面的错误监控函数，因此需要在错误回调中执行上一个错误回调函数，才能保证所有页面都能监听到global下产生的错误。这就产生了一个问题，某个页面产生的错误肯定会在所有已经渲染的页面中被监听到，导致多个页面重复上报同一个问题。不过这个问题还好解决，每个页面在上报前检测`error.stack`错误堆栈中是否存在当前页面的信息（now业务中的jsbundle都会存放到业务id路径下），now业务中就是通过判断每个业务的id来判断是否是当前业务产生的错误，来对筛选需要上报的错误。

### 未捕获的promise reject
```js
require('promise/setimmediate/rejection-tracking').enable({
  allRejections: true,
  onUnhandled: (id: number, data: object | string | RetcodeErrorMap, stack: string) => {
    let level: string = LOG_TYPE.PROMISE_ERROR;

    const errString: string = typeof data === 'object' ? JSON.stringify(data) : data;
    // retcode异常
    if (typeof data === 'object' && 'error' in data && 'retcode' in data.error) {
      if (!data.error.networkError) {
        level = LOG_TYPE.RET_ERROR;
      } else {
        return;
      }
    }
    this.publishErrorLog({
      msg: `PROMISE_ERROR: ${errString}\n${stack}`,
      level,
    });
  },
});
```
单例容器下所有代码都在同一个环境中运行，当promise reject未被捕获的情况下，我们可以通过`require('promise/setimmediate/rejection-tracking').enable({allRejections: true, onUnhandled(id, error) {...}})`来捕获。

在单例模式下，下一个页面初始化，将把上一个设置的监听函数覆盖掉，因此需要我们修改下rn使用的promise插件，修改的内容如下
```js
// promise/setimmediate/rejection-tracking.js
function enable(options) {
  // ...
  var oldErrorCB = Promise._87; // 获取之前的回调
  Promise._87 = function (promise, err) {
    if (promise._40 === 0) {
      promise._51 = id++;
      rejections[promise._51] = {
        displayId: null,
        error: err,
        stack: currentStack,
        timeout: setTimeout( // 注意这里使用了setTimeout
          onUnhandled.bind(null, promise._51),
          matchWhitelist(err, DEFAULT_WHITELIST)
            ? 100
            : 2000
        ),
        logged: false
      };
    }
    oldErrorCB && oldErrorCB(promise, err); // 发生异常时，之前的回调也一起执行
  };
  // ...
}
```
上面处理以后，所有页面都能够收到未捕获的promise reject消息。

Promise reject报出来的语法错误会有错误堆栈，我们可以像前面处理语法错误那样判断当前异常属于那个页面。但是，代码中主动调用reject抛出来的错误没有错误堆栈，我们没办法分辨是哪个业务报出来的，因此需要我们需要借助`Stack().stack`来获取当前执行的堆栈。我们看enable源码可以知道，promise中使用了setTimeout来异步执行onUnhandle回调，这导致原来的堆栈不存在，我们需要在执行setTimeout之前获取当前堆栈，我们继续修改promise插件。
```js
// promise/setimmediate/rejection-tracking.js
function enable(options) {
  // ...
  var oldErrorCB = Promise._87; 
  Promise._87 = function (promise, err, currentStack) {
    var currentErrorStack = Error().stack.split('\n').slice(3); // 获取整个代码执行的堆栈
    currentStack = currentStack || currentErrorStack || []; // 依次获取堆栈
    if (promise._40 === 0) {
      promise._51 = id++;
      rejections[promise._51] = {
        displayId: null,
        error: err,
        stack: currentStack,
        timeout: setTimeout(
          onUnhandled.bind(null, promise._51),
          matchWhitelist(err, DEFAULT_WHITELIST)
            ? 100
            : 2000
        ),
        logged: false
      };
    }
    oldErrorCB && oldErrorCB(promise, err, currentStack.join ? currentStack.join('\n') : ''); // 执行之前设置的回调，并传入堆栈信息
  };
  // ...
}
```
后续异常归属哪个页面跟错误捕获一样。

### 请求错误
ajax请求的loadend事件回调中，判断请求返回的状态码，等于0或者大于400的属于请求错误。

## 思考
- 直出代码构建过程，jsbundle被检测成js代码，打包后的代码，执行中包`__d is undefind`
修改直出代码中的`html-loader`，将jsbundle加入到rule中，让jsbundle内容也能以文本的形式写入到服务端代码中。

- jsbundle资源稳定性：直出服务挂了（代码错误或者函数出问题），如何让用户看到页面
项目在发布的时候，会将jsbundle、图片等资源发到cdn中，当直出服务挂了以后，所有jsbundle资源请求都降级到请求cdn资源，这样保证直出出问题后，用户还能看到数据。

- jsbundle包优化：图片资源被打包到jsbundle资源中，导致jsbundle过大，首次页面加载时间过长
jsbundle打包过程，将图片资源名字加上hash，在metro.config.js中的assetPlugins配置中配置一个插件，该插件能够将资源名字改成name+hash。  
项目在发布的时候，图片资源信息也一起发到cdn上。  
页面代码中会使用Image组件提供的`Image.resolveAssetSource.setCustomSourceTransformer`函数来修改将图片资源的地址修改成线上cdn地址。