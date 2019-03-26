## 处理方案一：

所有系统的一级域名相同的条件下

登录系统可以将存有用户登录信息的 token 存放到 cookie 中，并设置 cookie 的 domain 为 .example.com（.一级域名.顶级域）

如下是 egg.js 中设置的样式：

```
ctx.cookies.set('magicUserInfo', result.token, {
  domain: '.example.com',
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: false,
});
```

## 处理方案二：

不是所有系统的一级域名都相同：

这边登录页面使用的是服务器渲染，我们会将所有业务系统的 url 都存放在登录系统，因此我们可以在用户访问登录页面的使用就使用 iframe 将其他业务系统域下的 setCookie 页面下加载出来

用户在登录页面登录成功之后，我们使用 postMessage 来向其他业务系统的 setCookie 页面发送信息。

业务系统中的 setCookie 页面会监听 message 事件，当 message 事件触发的时候，将信息中存有用户登录信息的 token 存放到 cookie 中。

```
// 这是登录界面中使用 iframe 访问其他系统 setCookie 页面，domain 是登录系统中配置的
<div id="iframe-wraper">
  <% domains.forEach(domain => { %>
    <iframe style="display: none;" src=<%= domain %>></iframe>
  <% }) %>
</div>
```

```
// setCookie 页面代码如下，该页面能够监听window 的 message 事件，并将用户的登录信息写入 cookie 中。将所有系统后端都要存放一份 setCookie 页面，并设置一个能够访问该页面的路径
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script type="text/javascript">
  	window.addEventListener('message', function(e) {
      console.log(e)
  		var maxAge = 24 * 60 * 60 * 1000;
  		var ip_reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
  		var hostname = window.location.hostname;
  		var domain;
  		if (ip_reg.test(hostname)) {
  			domain = hostname
  		} else {
  			var hostArr = hostname.split('.');
  			var length = hostArr.length;
  			if (length > 2) {
  				domain = '.' + hostArr[length - 2] + '.' + hostArr[length - 1];
  			} else {
  				domain = hostname;
  			}
  		}
	    if (e.origin === 'http://www.example.com') {
	      document.cookie='magicUserInfo=' + e.data + ';domain=' + domain + ';max-age=' + maxAge;
	    }
	},false);
  </script>
</head>
<body></body>
</html>
```

```
// 用户登录成功以后就调用 setCookie 方法，setCookie 方法会使用 postMessage 向登录页面中 iframe 页面发送信息
function setCookie() {
  const wrapper = document.getElementById('iframe-wraper');
  wrapper.childNodes.forEach(node => node.nodeName.toLowerCase() === 'iframe' && node.contentWindow.postMessage(getCookie('magicUserInfo'), '*'));
}

function getCookie(name) {
  const cookieStr = document.cookie.split(';');
  cookies = cookieStr.map(cookie => cookie.split('='))
  let result;
  cookies.forEach(item => {
    if (item[0].trim() === name) {
      result = item[1];
    }
  });
  return result;
}
```

