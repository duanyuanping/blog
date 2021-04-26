## 资源流程
![](https://res-static.hc-cdn.cn/SEO/CDN%E8%8A%82%E7%82%B9%E6%97%A0%E7%BC%93%E5%AD%98%E5%9C%BA%E6%99%AF.jpg)  
（图片来源：https://www.huaweicloud.com/zhishi/cdn001.html）
- 客户端通过www.example.com请求资源，向本地dns服务发起域名解析
- 域名解析请求被发到通用dns服务器
- 通用dns服务器发现当前域名CNAME到www.example.com.c.cdnhwc1.com
- 本地dns服务请求通用dns服务返回的CNAME的域名
- cdn的dns服务器按照条件选出用户最快拿到资源的服务器ip
  - 筛选条件：离用户的距离、资源服务器的负载、有无缓存等
- 客户端拿到资源对应的ip地址后，向cdn资源服务器发起请求
- cdn资源服务器将对应数据返回

其中cdn资源服务器会校验本地是否存在用户请求的资源，如果不存在，就会请求上层资源缓存服务器，直到获取获取到资源；如果存在，就直接将本地的资源返回给用户。

cdn资源服务器资源更新方式：
- push：当前源站服务器资源发生改变了，将新的内容推送给cdn
- pull：当用户请求来到cdn，cdn服务器发现本地没有该资源，就去源站拉取该资源，然后在cdn上面缓存

## 缓存流程
cdn缓存：
- 用户想分发节点cdn服务器发起请求
- cdn节点判断当前文件是否是动态文件或者不缓存文件，如果是，就直接回源
- cdn节点判断当前是否有缓存，如果没有，就直接回源
- cdn节点判断缓存是否过期，如果没有过期，就返回缓存
- cdn节点缓存过期，请求回源检验资源文件是否有更新，如果没有更新，就将cdn节点的缓存返回给用；否则，将回源服务器中的资源返回给用户，并更新cdn节点本地缓存
![](https://user-gold-cdn.xitu.io/2018/11/8/166f2735f65e8be9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
(图片来源https://juejin.cn/post/6844903709982490638)

cdn缓存控制：使用http中的`cache-control`头，设置`max-age`，如果源站没有设置`max-age`，cdn会默认设置`max-age=600`，同时不能设置`no-cache`和`no-store`这两个值

如果cdn单独设置了文件缓存时间，那么这个时间会将`cache-control`中的`max-age`覆盖，即如果cdn中文件缓存设置了1小时，`max-age=600`，资源获取10分钟以后，源服务器资源内容发生变化了，用户再次从当前cdn节点获取同样资源时，cdn服务器会返回304，因为，在cdn服务这边觉得文件需要1小时后过期，所以将本地的缓存返回给用户了。  
对于上面这个问题，我们可以使用服务提供商，提供的强制刷新功能来刷新cdn节点中的资源。

## cdn劫持

### cdn劫持防范方式：https
### csp
### cdn劫持防范方式：sri
通过想link、script标签中写入integrity属性，浏览器通过对比当前请求回来的资源内容的hash与integrity属性中定义的hash是否一致，来判断当前资源是否被篡改或者拦截。
```js
<script
  scr="..."
  integrity="sha256-xxx sha384-yyy"
></script>
```
integrity中的值格式是`hash计算方法-计算的hash结果`，同时可以定义多个计算方法和计算结果，浏览器在进行资源比对过程，只要有一个算法比对成功，就认为当前内容没有被篡改。

项目中可以使用`webpack-subresource-integrity`打包工具，来生成生成内容hash并将结果写入script、link中。

当浏览器检测到资源被修改以后，如果资源请求的标签中定义了onerror回调，那浏览器就会执行这个回调，我们可以在这个回调中将被修改的内容进行上报，以便后续开发者来解决资源被拦截的问题。
```js
<script
  scr="..."
  integrity="sha256-xxx sha384-yyy"
  onerror="errorCallback"
  onsuccess="successCallback"
></script>
```
wepack中可以使用`script-ext-html-webpack-plugin`插件，将回调写入打包文件中。