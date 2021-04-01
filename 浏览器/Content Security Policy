# Content Security Policy
Content Security Policy（内容安全策略，简称csp）用于检查并阻止网页中加载非法资源的安全策略，可以减轻xss攻击危害和数据注入等攻击。本文介绍的主要内容有如何csp使用和业务接入csp流程这两部分。

## 简介
主要工作：定义一套当前页面资源加载的白名单，浏览器可以正常请求白名单中的资源，但是浏览器需要阻止对非白名单中的资源进行请求，同时将非法资源请求进行上报。

功能效果：减轻网页被xss攻击后所受到的危害。实际上csp是在xss攻击发生后才起作用，阻止请求注入的非法资源，csp并不是直接阻止xss攻击的发生。

## 使用方式
csp主要有两种使用方式，分别是设置响应头`Content-Security-Policy`和网页文档设置`meta`标签。

### 响应头
在网页html请求的响应头中进行定义，定义方式：  
```
Content-Security-Policy: 指令1 指令值1 指令值2; 指令2 指令值1;
```

例子：  
```
Content-Security-Policy: srcipt-src 'self' *.test.com'; img-src: https: data:;
```

定义中存在哪些key以及value定义规则，可以在[定义规则](#定义规则)中看到具体的介绍。

### meta
在网页html文件中进行定义，定义方式：
```
<meta
  http-equiv="Content-Security-Policy"
  content="指令1 指令值1 指令值2; 指令2 指令值1;"
>
```

例子：  
```
<html>
  <head>
    <meta
      http-equiv="Content-Security-Policy"
      content="srcipt-src 'self' *.test.com'; img-src: https: data:;"
    >
  </head>
  <body>...</body>
</html>
```
> 注意：由于html文档是从上至下进行解析，因此，meta尽量写在最前面，保证能够对所有资源请求进行约束。

### 效果
csp规则匹配到的资源都能够正常请求，一旦有非法资源请求，浏览器就会立即阻止，阻止的效果如下


![资源加载被阻止的效果图]()

## 定义规则
csp规则内容主要由指令和指令值这两部分构成，指令用于定义资源类型，指令值用于定义资源地址规则。

例子：  
```
Content-Security-Policy: srcipt-src 'self' *.test.com';
```  
上面csp规则中，`script-src`是脚本资源加载指令，`'self'`和`*.test.com`是指令值，当加载js脚本的时候，只有满足指令值定义的规则才能正常加载。

### 指令
| 指令 | 说明 | 示例 |
| --- | --- | --- |
| default-src | 定义所有类型资源加默认加载策略，当下面这些指令未被定义的时候，浏览器会使用`default-src`定义的规则进行校验 | `'self' *.test.com` |
| script-src | 定义JavaScript资源加载策略 | `'self' js.test.com` |
| style-src | 定义样式文件的加载策略 | `'self' css.test.com` |
| img-src | 定义图片文件的加载策略 | `'self' img.test.com` |
| font-src | 定义字体文件的加载策略 | `'self' font.test.com` |
| connect-src | 定义XHR、WebSocket等请求的加载策略，当请求不符合定义的规则时，浏览器会模拟一个响应状态码为400的响应 | `'self'` |
| object-src | 定义`<object>` `<embed>` `<applet>`等标签的加载策略 | `'self'` |
| media-src | 定义`<audio>` `<video>`等多媒体html标签资源加载策略 | `'self'` |
| frame-src | 【已废弃】定义iframe标签资源加载策略（新指令：child-src）| `'self'` |
| sandbox | 对请求的资源启用sandbox，类似于[iframe中的sandbox功能](https://www.w3school.com.cn/tags/att_iframe_sandbox.asp) | `allow-scripts` |
| report-uri | 定义上报地址。当有资源被拦截的时候，浏览器带着被拦截的资源信息请求这个uri。（只在响应头中定义才能生效） | `https://csp.test.com/report` |
| child-src | 【csp2】定义子窗口（iframe、弹窗等）的加载策略 | `'self' *.test.com` |
| form-action | 【csp2】定义表单提交的源规则 | `'self'` |
| frame-ancestors | 【csp2】定义当前页面可以被哪些页面使用ifram、object进行加载 | `'self'` |
| plugin-types | 【csp2】定义页面允许加载哪些插件 |  |

### 指令值
| 指令值 | 说明 | 示例 |
| --- | --- | --- |
| `*` | 所有内容都正常加载 | `img-src *;` |
| `'none'` | 不允许加载任何资源 | `img-src 'none';` |
| `'self'` | 允许加载同源资源 | `img-src 'self';` |
| `'unsafe-inline'` | 允许加载inline的内容（例如：style、onclick、inline js、inline css等） | `srcript-url 'unsafe-inline';` |
| `'unsafe-eval'` | 允许加载动态js代码（例如：`eval()`） | `script-src 'unsafe-eval';` |
| `http:` | 允许加载使用http协议的资源 | `img-src http:;` |
| `https:` | 允许加载使用https协议的资源 | `img-src https:;` |
| `data:` | 允许使用data协议（css中加载base64图片使用的就是data协议）| `img-src data:;` |
| 域名 | 允许加载该域名下所有https协议的资源 | `img-src test.com;` |
| 路径 | 允许加载该路径下所有https协议的资源 | `img-src test.com/img/;` |
| 通配符 | `*.test.com`允许加载子域名下所有https协议的资源（任意子域名）；`*://*.test.com:*`这个匹配逻辑原意是任意协议、任意子域名、任意端口，但在实际测试过程中发现这个指令值没有任何作用 | `img-src *.test.com;` |

## 实际业务开发
前面我们了解csp基本用法以后，接下来讲述下业务就入csp的流程。由于浏览器会禁止加载违反csp规则的资源，因此，我们需要对csp进行一系列验证后，才能正式上线，下面笔者将一步一步的带着大家完成业务csp规则的部署。
### 整理资源地址
<!-- window.performance.getEntries().map(info => info.name).filter(str => !!~str.indexOf(':')) -->
web页面中，浏览器有提供`performance.getEntries()`接口，用于获取网页加载的资源信息，其中`initiatorType`和`name`两个属性非常有用，`initiatorType`（资源类型）属性可以知道资源属于哪个指令，`name`（资源地址）可以定义指令值有哪些。

下面为了简便，只使用`default-src`这一个指令，资源匹配上某个指令后，直接走`default-src`定义的规则。
```javascript
const entries = window.performance.getEntries()
const names = entries.map(info => info.name);
```

### 生成csp规则
```javascript
const parseReg = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
const httpList = [];
const httpsList = [];
const otherProtocol = [];

// 分离https、http、其他协议资源
names.forEach(str => {
  const parse = parseReg.exec(src);

  // 实测 *://*.test.com:*并不能匹配test.com任意协议、任意子域名、任意端口，因此这里将http和https分离
  if (['https', 'http'].includes(parse[1])) {
    const domain = parse[3];
    const midProduct = domain.split('.');
    const midProductLen = midProduct.length;
    const childDomain = midProductLen > 2 ? `*.${midProduct.slice(midProductLen - 2).join('.)}` : domain;

    if (parse[1]) === 'https') {
      httpsList.push(childDomain);
    } else {
      httpList.push(`http://${childDomain}`);
    }
  } else {
    otherProtocol.push(parse[1]);
  }
});

const defaultSrc = otherProtocol.concat(httpsList).concat(httpList).join(' ');
```
前面`defaultSrc`值基本上就是`default-src`指令的值了，当然如果项目中存在inlin的代码或者使用了`eval`函数动态执行js代码，就需要在`default-src`中配置额外的值。

### 本地测试
在谷歌浏览器插件应用，添加`CSP Mitigator`插件，然后配置页面地址、csp规则信息。  
![CSP Mitigator使用](https://nowpic.gtimg.com/hy_personal_room/0/now_acticity1599050520062.png/0)
配置完成以后，点击start开始测试。进入业务页面，查看控制台有哪些资源不符合csp规则，然后再根据报错信息将csp规则补全。
![不符合csp规则的资源](https://nowpic.gtimg.com/hy_personal_room/0/now_acticity1599050817037.png/0)
本地测试没有违背csp规则的资源后，还是不能直接将规则写入线上页面的`Content-Security-Policy`响应头。

### 上线测试
一般情况下，浏览器会禁止加载违反csp规则的资源，这对于csp准确度要求比较高，如果我们不小心遗漏了某个规则，将会影响到页面正常展示，这无疑会给开发者带来巨大的压力。浏览器为了解决这一问题，提供了`Content-Security-Policy-Report-Only`响应头，对于违反csp规则的资源，只进行上报处理，不禁止加载资源，这样我们可以在不影响业务使用的情况下，逐渐补全csp规则。  

资源被阻止后，浏览器上报的内容如下：
![](https://nowpic.gtimg.com/hy_personal_room/0/now_acticity1598801325422.png/0)

### 正式上线
如果确认csp上报的资源只有非法资源了，此时便可以将响应头改成`Content-Security-Policy`。当响应头改为`Content-Security-Policy`以后，违背csp规则的资源会被禁止加载，同时请求配置的上报接口。

## 参考
- [Content Security Policy 介绍](https://imququ.com/post/content-security-policy-reference.html)
- [Content Security Policy 入门教程](http://www.ruanyifeng.com/blog/2016/09/csp.html)
- [Content Security Policy Level 2 介绍](https://imququ.com/post/content-security-policy-level-2.html)
- [XSS的克星——CSP理论与实践总结](http://km.oa.com/group/22651/articles/show/256234?kmref=search&from_page=1&no=2)
- [腾讯内容安全防护策略（CSP）部署规范](http://km.oa.com/group/18092/articles/show/318568)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [performance.getEntries()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntries)
