## 微信图片不可引用问题
在非微信域名的网页中引用微信图片，会出现“未经允许不可引用”，这主要是因为微信图片服务会检测当前请求的referrer，如果当前referrer非法（不为空&&非白名单域名），就会返回前面的提示。

这里解决方案也很简单，因为微信图片服务检测到referrer为空时，也会返回图片内容，我们可以在img标签中定义`referrerPolicy`。

当然也可以直接使用meta，全局禁止资源请求携带referrer`<meta name="referrer" content="no-referrer" >`，关于name为referrer的content可以在[mdn Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)中了解。

我们还可以使用重定向的方式来解决referrer校验问题，我们需要构建一个重定向服务，客户端请求微信图片的时候，直接请求自定义服务，该服务接收到微信图片请求时，直接使用301或者302将请求重定向到真实的图片资源，此时浏览器自动请求图片的时候不会带上referrer，这样同样可以解决微信图片不可引用问题。

## meta no-referrer导致百度统计失效
百度统计的`hm.js`文件服务只有在检测到请求中的referrer以后才会返回正确的js资源，否则会响应空的内容。

解决方案有两种：  
1、不使用meta来禁用referrer，可以对a、img、script等标签单独定义请求的时候是否传referrer，或者使用重定向。  
2、动态添加meta。等百度统计的js资源请求成功以后，再使用js将meta添加到head中。
```
const meta = document.createElement('meta');
meta.content='same-origin';
meta.name='referrer';
document.getElementsByTagName('head')[0].appendChild(meta);
```