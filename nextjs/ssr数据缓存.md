# nextjs ssr数据缓存
本文使用到nextjs@10作为项目开发，使用[lru-cache](https://www.npmjs.com/package/lru-cache)插件作为直出结果缓存工具。本文所述的ssr缓存效果可以在[猎豹影院](https://www.liebaoyy.com)看到。

如果大家只想知道如何实现，可以直接跳到最后看实现源码，当然如果大家想知道nextjs直出缓存的相关细节可以以此往下阅读。

## getInitialProps or getServerSideProps
nextjs直出本身不存在缓存功能，我们需要先拿到直出的html内容，然后将直出内容缓存在服务器中。nextjs提供了一个`renderToHTML` api供我们获取直出的html，我们可以通过下面的方式来调用：
```javascript
const next = require('next');
const app = next({ dev: isDev });

// 获取直出的html
app.renderToHTML(...);
```
nextjs也提供了`getRequestHandler`api，来获取自动处理页面请求的函数，`const handle = app.getRequestHandler()`。

在nextjs直出环境下，页面组件中我们可以通过`getInitialProps`和`getServerSideProps`这两个api来获取记录页面渲染所需的数据。nextjs会将从这两个api中拿到的数据写入到id为`__NEXT_DATA__`的script标签中。

我们在进行业务开发的时候`getInitialProps`和`getServerSideProps`这两个api只有一个有效，当我们这两个函数都定义以后，项目构建中会报警。一般情况下，我们优先使用`getServerSideProps`，这也是官方所推崇的。但是，在做直出数据缓存的时候我们需要使用`getInitialProps` api。关于这两个api的使用，大家可以在nextjs官方文档中看到，这里就不再赘述。

在调用`renderToHTML`渲染页面的时候，使用`getInitialProps`和`getServerSideProps`这两个api进行数据获取时，渲染表现会有一定的出入。
- `getInitialProps`：调用`renderToHTML`函数，会返回直出的html，开发者需要手动调用`res.end`将结果返回给客户端。
- `getServerSideProps`：调用`renderToHTML`函数，`renderToHTML`内部在获得直出的html后，会去判断当前是否使用的`getServerSideProps`来获取的直出数据，如果是，就会直接调用`res.end`将数据缓存，然后将`renderToHTML`函数返回的直出html至空，源码如下：
```js
// https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/next-server.ts#L1842
if (
  !isResSent(res) &&
  !isNotFound &&
  (isSSG || isDataReq || hasServerProps)
) {
  if (isRedirect && !isDataReq) {
    await handleRedirect(pageData)
  } else {
    sendPayload(...)
  }
  resHtml = null
}

// https://github.com/vercel/next.js/blob/canary/packages/next/next-server/server/send-payload.ts#L38
export function sendPayload(
  req: IncomingMessage,
  res: ServerResponse,
  payload: any,
  type: 'html' | 'json',
  {
    generateEtags,
    poweredByHeader,
  }: { generateEtags: boolean; poweredByHeader: boolean },
  options?: PayloadOptions
): void {
  // ...
  if (!res.getHeader('Content-Type')) {
    res.setHeader(
      'Content-Type',
      type === 'json' ? 'application/json' : 'text/html; charset=utf-8'
    )
  }
  res.setHeader('Content-Length', Buffer.byteLength(payload))

  res.end(req.method === 'HEAD' ? null : payload)
}
```
通过上面我们了解到通过`getServerSideProps` api获取直出数据，调用`renderToHtml`函数时无法拿到html，并且直出结果会在`renderToHtml`函数中调用`res.end`响应给客户端，在调用`renderToHtml`后就没法再调用`res.end`。

相对于`getServerSideProps`，`getInitialProps`作为页面获取数据的方式更加可控，我们不仅可以拿到直出的html，还可以控制如何响应当前请求。因此后面将使用`getInitialProps`作为直出数据获取的方式。

## 直出缓存代码
```js
// server.js
const express = require('express');
const next = require('next');
const LRUCache = require('lru-cache');

const port = parseInt(process.env.PORT, 10) || 3000;
const isDev = process.env.NODE_ENV === 'development';
const app = next({ dev: isDev });

// nextjs原生请求处理函数
const handle = app.getRequestHandler();

// 缓存工具初始
const ssrCache = new LRUCache({
  max: 100,
  maxAge: 1 * 60 * 60 * 1000, // 1小时缓存
});

// 使用请求的url作为缓存key
function getCacheKey (req) {
  return `${req.url}`
}

function renderAndCache (req, res, pagePath, queryParams) {
  const key = getCacheKey(req)
  // 如果缓存中有直出的html数据，就直接将缓存内容响应给客户端
  if (ssrCache.has(key)) {
    res.send(ssrCache.get(key));
    return    
  }

  // 如果没有当前缓存，调用renderToHTML生成直出html
  app.renderToHTML(req, res, pagePath, queryParams)
    .then((html) => {
      if(res.statusCode === 200) {
        // 使用缓存工具将html存放
        ssrCache.set(key, html);
      }else{
        ssrCache.del(key);
      }
      
      // 响应直出内容
      res.send(html);
    })
    .catch((err) => {
      app.renderError(err, req, res, pagePath, queryParams)
    })
}

async function main() {
  await app.prepare();

  const server = express();
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });

  server.get('/', (req, res) => renderAndCache(req, res, '/'));

  // app.getRequestHandler()得到的原生资源处理函数，静态资源请求、直出请求这个函数都能正常处理
  server.get('*', (req, res) => handle(req, res));
}

main();
```
```json
// package.json
{
  // ...
  "scripts": {
    "dev": "cross-env NODE_ENV=development node server.js",
  }
}
```
```js
// 页面代码
export default function Home() {}

Home.getInitialProps = async () => {
  reutrn {
    // 直出所需数据
  }
}
```

