# node爬虫入门

## 前言

本文讲述的是如何爬取网页中的内容。

这里只展示编写一个简单爬虫，对于爬虫的一些用处还不清楚，暂时只知道一些通用的用处：搜索引擎使用网络爬虫定向抓取网页资源、网络上面的某一类数据分析、下载很多小姐姐的图片（手动狗头）。

爬虫工作大致的步骤就是下面这两点：下载网页资源、抓取对应的网页内容。

## 正文

### 网页资源下载

下载网页内容我们可以使用fetch，或者使用superagent、axios、request等工具库，由于后面需要对文件动态解码，所以这里我们选择request工具库来完成资源的加载的任务

爬虫从加载的网页资源中抓取的相应内容具有一定的局限性，比如使用JavaScript动态渲染的内容、需要用户登录等操作后才能展示的内容等都无法获取到，后文将介绍使用puppeteer工具库加载动态资源。

下面先介绍如何使用request库加载网页资源。

#### request加载网页资源

request学习地址：<https://github.com/request/request>

我们这里以抓取博客园（<https://www.cnblogs.com>）中展示的博客为例子，来制作爬虫。

观察博客园推荐博客的列表分页不难发现其实每页的url（第二页：<https://www.cnblogs.com/#p2>）是（<https://www.cnblogs.com> + /#p + 页数）拼接出来的，因此我们可以通过请求这些url，来加载网页资源，具体代码如下：

```
const request = require('request');
const pageCount = 200; // 需要请求的数据页数
const urls = []; // 用来存放页面的url
const proxy = 'https://www.cnblogs.com';

for (let i = 0; i < pageCount; i++) {
  urls.push(`${proxy}/#p${i + 1}`);
}

urls.map(url => {
  request({ url }, (err, res) => { // res是请求的响应对象，其中包含headers和body这两个我们后面会用到的属性
  	if (err) return;
  	
    console.log(res.headers); // 响应头，后面需要读取里面的content-type属性，来判断响应的内容是否是html文件
    console.log(res.body); // 响应体，如果res.headers.content-type字符串中包含text/html就表示响应的内容是html文本，这里打印出来就是一段html代码
  })
})
```

在上面资源请求中存在一个问题：js同步代码与异步请求任务不是在同一个线程中执行，上面代码可能导致同一时间有200个异步请求在执行，这样可能导致程序因为内存不足崩溃，因此我们这里需要控制一下并行的请求数，代码如下（这里可以跳过，他不影响爬虫入门学习，只是需要知道后面的写法是用来控制并发量的）：

```
/** 
 * runLimit.js
 * @param {Array} arr 待执行的任务数组，任务执行后返回一个 promise
 * @param {Number} limit 最大并行数 
 */
module.exports = (arr, limit) => {
  if (!Array.isArray(arr)) return Promise.all([]);

    const tasks = [...arr]; // 待执行的任务队列
    const result = []; // 任务执行完结果存放
    let parallelNum = 0; // 当前正在运行的任务数

    return new Promise((resolve, reject) => {
      const fn = () => {
        // 循环取出待执行任务队列中的任务
        setImmediate(() => {
          // 如果待执行任务队列为空，就返回所有运行结果
          if (tasks.length < 1) {
            return Promise
              .all(result)
              .then(data => resolve(data));
          }

          // 如果当前正在执行的任务数小于最大并行数并且待执行任务队列不为空，就取出待执行任务队列中的第一个任务执行
          while(parallelNum < limit && tasks.length > 0) {
            const task = tasks.shift();
            parallelNum++;
            result.push(
              // 任务函数执行会返回一个Promise实例
              task(parallelNum)
                .then(data => {
                  parallelNum--;
                  return data;
                })
                .catch(err => err)
            );
          }
  
          fn();
        })
      };
  
      fn();
    });
}
```

修改之前请求200页页面资源的代码，控制并发量，如下：

````
const request = require('request');
const runLimit = reuqire('./runLimit');

const pageCount = 200;
const urls = [];
const proxy = 'https://www.cnblogs.com';
const limit = 5; // 最大任务并行量

for (let i = 0; i < pageCount; i++) {
  urls.push(`${proxy}/#p${i + 1}`);
}

// 控制并发的函数借助执行tasks中的函数返回的Promise对象判断函数是否执行完成（有点绕，如果不是很懂可以看下上面runLimit.js的实现）
const tasks = urls.map(url => parallelNum => new Promise((resolve, reject) => {
	console.log('当前并行任务数：', parallelNum);
	console.log('当前执行的新任务：', url);
  request({ url }, (err, res) => {
  	if (err) reject(err);
 
  	resolve(res)
  });
}));

runLimit(tasks, limit) // 调用任务并行量控制函数，返回一个Promise实例
	.then(result => console.log(result)); // 这里就是所有请求所有页面的响应体对象
````

#### 解析并读取html文档

我们可以通过正则来读取前面响应体中我们想要的内容，这样做工作量会比较大。我们这里使用一个cheerio工具库对响应体html文档进行处理，让我们能够通过jQuery的语法读取到我们想要的内容。

cheerio使用教程：<https://github.com/cheeriojs/cheerio>

cheerio能够处理html结构的字符串，并让我们能够通过jq的语法读取到相应的dom。

下面将展示读取博客园首页(<https://www.cnblogs.com>)中的博客列表信息：

在开始写代码前我们需要分析一下博客园首页的结构。

![1561362270330](http://psh01f5cu.bkt.clouddn.com/1561362270330.png)

由上图中我们可以知道列表元素被一个id为post_list元素包裹着，单个列表元素内容是由class为post_item的div元素包裹。

我们下面抓取的内容也就是class为post_item列表中的部分内容，抓取内容有文章名、文章内容链接、作者、作者主页，如下图：

![1561362657958](http://psh01f5cu.bkt.clouddn.com/1561362657958.png)

```
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

request({ url: 'https://www.cnblogs.com' }, async (err, res) => {
  if (err) return;
  // 这里我们调用cheerio工具中的load函数，来对响应体的html字符串处理，load函数执行返回一个jq对象
  const $ = cheerio.load(res.body);
  await fs.writeFile('result.json', '[\n');
  await $('div#post_list div.post_item').each(async (index, item) => {
    const TDom = $(item).find('a.titlelnk'); // 获取博文列表标题信息元素
    const ADom = $(item).find('a.lightblue'); // 获取博文列表作者信息元素
    // 读取元素中的信息
    const info = {
      title: TDom.text(),
      blogUrl: TDom.attr('href'),
      author: ADom.text(),
      personalHomePage: ADom.attr('href')
    };
    await fs.appendFile('result.json', `${index === 0 ? '' : ',\n'}${JSON.stringify(info)}`);
  });
  fs.appendFile('result.json', '\n]');
})
```

上面代码可以在我的github（<https://github.com/duanyuanping/reptile>）中的example3.js看到

上面简单展示了使用cheerio读取html文档信息的功能，后面我们将cheerio用在前面请求200页博文列表页面的代码中，具体代码如下：

```
// getListData.js
const fs = require('fs');
const cheerio = require('cheerio');

module.exports = async html => {
  const $ = cheerio.load(html);
  const result = [];
  
  await $('div#post_list div.post_item').each(async (index, item) => {
    const TDom = $(item).find('a.titlelnk'); // 获取博文列表标题元素
    const ADom = $(item).find('a.lightblue'); // 获取博文列表作者元素
    // 读取元素中的信息
    const info = {
      title: TDom.text(),
      blogUrl: TDom.attr('href'),
      author: ADom.text(),
      personalHomePage: ADom.attr('href')
    };
    result.push(info);
    await fs.appendFile('result.json', `${JSON.stringify(info)},\n`, () => {});
  });

  return result;
}
```

```
// blogs.js
const fs = require('fs');
const request = require('request');
const runLimit = require('./runLimit');
const getListData = require('./getListData');

const pageCount = 200;
const urls = [];
const proxy = 'https://www.cnblogs.com';
const limit = 5; // 最大任务并行量

for (let i = 0; i < pageCount; i++) {
  urls.push(`${proxy}/#p${i + 1}`);
}

const tasks = urls.map(url => parallelNum => new Promise((resolve, reject) => {
	console.log('当前并行任务数：', parallelNum);
	console.log('当前执行的新任务：', url);
  request({ url }, async (err, res) => {
  	if (err) reject(err);
    const data = await getListData(res.body);
  	resolve(data)
  });
}));

const fn = async () => {
  await fs.writeFile('result.json', '[\n', () => {});
  await runLimit(tasks, limit) // 调用任务并行量控制函数，返回一个Promise实例
    .then(result => console.log(result)); // 这里就是所有请求所有页面的响应体对象
  await fs.appendFile('result.json', ']', () => {});
}

fn();
```

前面这部分代码可以（<https://github.com/duanyuanping/reptile>）这个网址中看到。（blogs.js、getListData.js、runLimit.js）

### 问题

#### html文档解码

我们使用前面同样的请求资源的代码请求（<https://www.biquku.com/0/330/>）这个地址，然后将body中的数据打印出来，我们会看到中文部分全是乱码 ，如下图：

![1561377652913](http://psh01f5cu.bkt.clouddn.com/1561377652913.png)

这是因为request默认使用utf-8解码的html文件，其实html文件编码格式不只是utf-8也有可能是gbk（gb2312），而上面给的这个网址正好是使用gbk编码的。

解决办法：我们需要先读取html文件中`<meta charset="编码格式">`这个标签来确定文档编码格式，然后再对文件的buffer数据进行解码。

request使用方式`request(options, response)`其中options对象中我们可以提供一个encoding来控制解码格式，这里我们给encoding传入null，让request请求成功后不对响应体进行解码，然后我们匹配html文档中的charset值，然后借助iconv-lite工具库(<https://github.com/ashtuchkin/iconv-lite>)帮我对响应体进行解码，代码如下：

```
// encoding.js

const request = require('request');
const iconvLite = require('iconv-lite');
const url = 'https://www.biquku.com/0/330/';

request({
  url,
  encoding: null, // request 请求成功，不自动解码文件
}, (err, res) => {
  if (err) return;

  // 判断响应体内容是否是html文档
  const contentType = res.headers['content-type'];
  const isHtmlType = contentType && contentType.indexOf('text/html') > -1;

  const body = res.body;
  const str = body.toString();
  let data = '';

	// html文档解析
  if (isHtmlType !== -1) {
    // 读取文档中的charset值
    const charset = (str && str.match(/charset=['"]?([\w.-]+)/i) || [0, null])[1]; // 本段正则来自 https://www.npmjs.com/package/crawler 库
    // 调用iconv-lite库解析文档
    data = iconvLite.decode(body, charset);
  }

  console.log(data);
})
```

经过处理后的文档内容就能够正常显示了。

上面代码可以从（<https://github.com/duanyuanping/reptile>）中的encoding.js文件看到。

#### js动态插入的数据读取

前面我们使用request库请求回来了html文档，然后使用cheerio对文档进行解析，整个过程没有去像浏览器那样解析渲染html文档、运行js。因此，我们只能读取到服务器返回的那些页面数据，而不能获取到一些js动态插入的数据。

例如now直播首页（<https://now.qq.com/pcweb/index.html>）推荐列表中的数据，下图标出来的数据

![1561379524162](http://psh01f5cu.bkt.clouddn.com/1561379524162.png)

我们使用之前爬虫方案无法爬取到这些信息。因为这块是js在浏览器运行时动态添加到网页中的内容，因此，我们请求首页时返回的数据并没有这里的数据。我们想要获取到这块数据就需要，在node服务中运行一个浏览器环境，然后让网页在浏览器环境下面运行，之后我们就能读取到这个列表的内容了，具体用到puppeteer工具库（<https://github.com/GoogleChrome/puppeteer>）来实现。

puppeteer是由Google Chrome开发的一个在node环境下运行的浏览器环境工具库，这个工具可以拿来做爬虫、页面测试用例、性能诊断等功能。

获取js动态插入内容的栗子代码如下：

```
// getDynamic.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const url = 'https://now.qq.com/pcweb/index.html';

const fn = async () => {
  const result = [];
  const browser = await puppeteer.launch(); // 开启浏览器环境
  const page = await browser.newPage(); // 打开新的页面
  await page.goto(url); // 进入某个url
  const dom = await page.$eval('html', html => html.outerHTML); // 读取整个最新的html文档
  const $ = cheerio.load(dom, 'utf-8'); // cheerio解析html文档（不清楚到底会不会得不偿失，相对puppeteer语法和js源生，个人比较喜欢用jq）
  // 读取信息
  $('div.anchor-item').each((i, item) => {
    result.push({
      title: $(item).find('div.v-emotion').text(),
      url: $(item).find('div.room-cover a').attr('href')
    });
  });
  console.log(result);
  // 关闭浏览器环境
  browser.close()
};

fn();
```

在上面代码中就能够读取到js动态写入的内容。

由于开启浏览器环境、运行解析渲染html文件、运行js文件等内容需要大量的时间，因此使用这种方式爬取需要消耗大量时间。

当然我们还有其他的方案，就是在network中观察这些列表与什么接口有关，然后使用node直接请求这些接口，这样速度会快很多，当然就需要自己去观察了。而使用puppeteer我们就不用去关心页面到底请求什么接口，都可以一把梭直接获取到数据。这两种方案都有利弊，看自己想要使用哪种方案了。这里就不展示后面的方法了。

### 爬虫工具库

node中的爬虫库node-crawler（<https://github.com/bda-research/node-crawler>），开发者可以直接将想要爬取的网页url传入，然后他会返回一个jq对象（工具库内部也使用的cheerio库解析html），开发者操作jq获取需要爬取的内容。但是这个库中的api没有使用then-able方案，使用的是callback方案，以及js动态写入的内容无法获取到。

下面介绍一下我写的一个工具库（写这个目的是想加深对制作爬虫工具使用的印象）来封装了部分复用的代码，代码在（<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js>）

#### 实现的功能

开发者实例一个Crawler对象，然后调用该对象下的queue函数并传入url（可以是字符串或者数组），queue函数执行后会返回一个Promise对象，因此可以直接使用.then来读取到返回的对象，然后使用这个数据里面的jq对象读取页面中的内容。当然也可以在实例Crawler对象的时候传入callback函数，当解析成功后就会直接调用这个回调。

如果想要读取页面中js动态写入的内容，就需要在实例Crawler对象时传入`isStatic: false`，这样这个库就能够返回一个解析了js动态写入后的文档内容的jq对象、page对象以及browser对象。

在实例Crawler对象的时候可以传入maxConnections属性来控制任务并行数。

这些功能都是在前面展示过的内容，这里只是将这些功能整合起来了。

使用例子可以简单看下（<https://github.com/duanyuanping/reptile>）中的example1.js和example2.js两个文件

#### 代码结构

[crawler.js](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js>)

构造函数：[constructor](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L7>)

```
// 这里主要是实例Crawler对象时属性初始化
constructor(params) {
  const {
    maxConnection = 10,
    callback = this.callback,
    isStatic = true, // 是否不存在js动态拉取数据渲染
  } = params;

  this.maxConnection = maxConnection;
  this.callback = callback;
  this.isStatic = isStatic
}
```

解析网页的入口函数：[queue](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L24>)

```
/**
 * 入口
 */
queue(url) {
	// 是否是读取非js写入的内容，这里不直接使用获取js动态写入的内容的函数的原因是，获取js动态写入的内容需要开启浏览器、解析渲染html、运行js等等耗时任务，所以这里需要分离成两类函数
  const fetchFn = this.isStatic ? this._fetchStaticContent.bind(this) : this._fetchDynamicContent.bind(this);
  // 处理多个 url 字符串数组
  if (Array.isArray(url)) {
    return fetchFn(url);
  // 处理单个 url 字符串
  } else if (typeof url === 'string') {
    return fetchFn([url]);
  }
}
```

解析非js动态写入的内容：[_fetchStaticContent](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L41>)

```
/**
 * @desc 抓取多个页面中的元素
 * @param {Array} urls 需要抓取的 url 集合
 * @returns {Promise} 
 * @memberof Crawler
 */
async _fetchStaticContent(urls) {
	// 对urls中的每个url元素url发起请求
  const fn = url => new Promise((resolve, reject) => {
    const options = {
      url,
      encoding: null
    };
    const response = (err, res) => {
    	// 请求响应体html文档解码
      const result = this._doEncoding(res);
      // 解析响应体html文档
      const $ = result.isHtmlType !== -1 ? cheerio.load(result.str) : null;
      // 返回结果对象
      resolve({ ...res, $, body: result.str });
    };
		// 请求资源
    request(options, response);
  });

	// 这里执行统一调用控制并发函数的函数
  return this._doRunLimist(urls, fn);
}
```

解析js动态写入的内容 ：[_fetchDynamicContent](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L64>)

```
/**
   * @desc 抓取js动态渲染的页面的内容
   * @param {Array} urls 需要抓取的 url 集合
   * @returns {Promise} $：jq对象；browser：浏览器对象，使用方式如后面的链接；page：使用方式，https://github.com/GoogleChrome/puppeteer;
   */
  async _fetchDynamicContent(urls) {
    console.log('请及时调用 browser.close() 异步函数消费掉 browser 对象，不然会导致程序卡死');
    // 对urls中的每个url元素发起请求
    const fn = url => new Promise(async (resolve, reject) => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);
      const dom = await page.$eval('html', html => html.outerHTML);
      const $ = cheerio.load(dom);
      // 返回结果对象
      resolve({ $, page, browser });
    });

    return this._doRunLimist(urls, fn);
  }
```

统一调用控制并发量函数：[_doRunLimist](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L84>)

```
/**
 * @desc 统一调用 _runLimit，减少的代码重复
 * @param {Array} urls 请求的页面地址
 * @param {Function} fn 各自业务处理逻辑
 * @returns 如果 urls 的 length 为 1，返回 { res, $, err },；如果 length 大于 1，返回  [{res, $, err}, ...]
 */
async _doRunLimist(urls, fn) {
  const tasks = urls.map(url => parallelNum => {
    console.log('当前并发量：', parallelNum, url);
    return fn(url, parallelNum);
  });

	// 调用控制并发的函数
  const result = await this._runLimit(tasks);

	// 返回运行结果，urls的length小于2就返回一个{}对象，urls的length大于1就返回一个数组
  if (urls.length < 2) {
    this.callback(result[0])
    return result[0];
  } else {
    this.callback(result);
    return Promise.all(result);
  }
}
```

解码函数：[_doEncoding](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L106>)

控制并发的函数：[_runLimit](<https://github.com/duanyuanping/reptile/blob/master/assets/crawler.js#L136>)

上面所有例子都在<https://github.com/duanyuanping/reptile>这个仓库里面。

### 参考资料

[分分钟教你用node.js写个爬虫](<https://juejin.im/post/5b4f007fe51d4519277b9707>)

[PHP,Python,nod.js哪个比较适合写爬虫](<https://www.zhihu.com/question/23643061>)

[前端爬虫系列](<https://www.cnblogs.com/coco1s/p/4954063.html>)

[request](https://github.com/request/request)

[cheerio](<https://github.com/cheeriojs/cheerio>)

[iconv-lite](https://github.com/ashtuchkin/iconv-lite)

[puppeteer](https://github.com/GoogleChrome/puppeteer)

[node-crawler](https://github.com/bda-research/node-crawler)

