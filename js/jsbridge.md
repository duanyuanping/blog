## js调用native接口
js中调用native主要有注入API和拦截url schema两种方式。

### 注入API
native通过调用webview提供的接口，向js的全局上下文对象（window）中注入对象或者是方法，当js代码执行的时候，直接运行native代码逻辑，来达到js调用native的目的。

### 拦截url schema
url schema是一种类似与url的链接，主要区别在于协议和域名需要自定义。例如：qunarhy://hy/url?url=ymfe.tech，此url schema链接中协议是qunarhy，域名是hy。

urlschema拦截的主要流程：web使用某种方式（例如iframe.src）发送url schema请求，客户端拦截请求，并根据url schema进行相应处理。

此种方案存在下面一些问题：
- 使用iframe.src请求的url有长度限制
- 创建请求需要一定的时间，比注入API方式耗时更长

## natice调用js
native调用js，其实就是执行js字符串，js方法必须写在window上，然后native执行该方法名。

- iOS 的 UIWebView
```js
result = [uiWebview stringByEvaluatingJavaScriptFromString:javaScriptString];
```
-  iOS 的 WKWebView
```js
[wkWebView evaluateJavaScript:javaScriptString completionHandler:completionHandler];
```
- Android
```js
webView.loadUrl("javascript:" + javaScriptString);
```