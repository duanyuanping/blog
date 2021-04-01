今天我带来的是关于JAMStack网页构建解决方案的分享，主要从一下4个方面进行介绍。

1. JAMStack介绍
2. JAMStack实践
3. 部署
4. 适用性分析

## JAMStack介绍
JAMStack是一种使用静态网站生成器(SSG) 技术、不依赖Web Server的前端架构思想。  

使用JAMstack编写的应用构建完成后，就只是一堆HTML、JavaScript和CSS文件，以及所有附带的资源（图像和附件等）。任何时候都没有服务端处理过程，这给 JAMstack 应用带来了巨大的好处？  

从下面图中我们可以看到，JAM构成的要素有JavaScript、apis、makup（标记，也可以markdown）

![](https://1024.com/uploads/editor/oa/p3hbgdyg18j2.jpeg)

- JavaScript：它既可以是React和Vue这种Web框架，也可以是原生的JavaScript。主要负责网页动态的内容。
- APIS：JAMStack的Web应用会通过JavaScript给后端API发送AJAX请求或者GraphQL query，后端API会以某种格式（一般是JSON）返回数据给前端来实现一些用户交互。
- Markup，预渲染标记型语言（pre-rendered Markup）。其中比较常用的就是HTML和Markdow，Markdown类型的文件通常是用来作为生成静态HTML文件的数据源。有用过hexo写博客的同学对这个概念肯定不会陌生，因为hexo的原理就是将我们编写的Markdown文件根据我们指定的主题或者模板生成一些静态的HTML然后托管在github pages或者其它类似的静态网站服务器来供别人访问的。

## JAMStack实践
了解基本概念后，下面我们来看一个Gatsby开发的小demo，来了解下JAMStack应用是如何运行的。

![](https://nowpic.gtimg.com/hy_personal_room/0/now_acticity1599810870961.png/0)
![](https://nowpic.gtimg.com/hy_personal_room/0/now_acticity1599810870953.png/0)

这个项目是一个博客网站，上面这两张图就是demo的主要页面，网站中主要功能有：展示我发表的博客列表（静态内容）。博客详情页面，展示选中的博客内容（静态内容）。博客评论功能（动态内容）。

所谓静态的内容就是那些不会经常发生变化的内容，这些内容在一段时间内不同用户访问的时候都会得到同样的结果。而动态的内容就是那些频繁发生变化的内容，例如游客对我的博客的评论

下面将分开讲述静态内容和动态内容这两部分内容在gatsby中实现。

gatsby构建的静态网页主要的数据源是本地的md文件。当我们新建一个md文件的时候，程序能够根据md文件构建出一个生成新的html文件。


从md文件新建到html文件生成，这一过程如下：
获取到md文件信息->md文件信息存放->创建html文件

### md文件信息获取
gatsby中会使用`gatsby-source-filesystem`插件来监听目录变化情况，当发现目录内容发生改变的时候，会使用`gatsby-transformer-remark`插件解析md文件，获取md文件路径、类型、唯一id等信息，然后执行自定义的`onCreateNode`函数，这个`onCreateNode`函数会生成文件的`slug`值，这个用来作为页面的一种标识，后面会依据这个值来生成文件存放路径和静态页面预渲染数据选用上面。

### 数据存储
gatsby会在本地启动一个graphql服务，然后会将刚才生成的md信息和默认配置上传到这个服务器中，后续html文件预渲染时，构建器会使用graphql获取页面数据。

目的：

### markdow转成html
项目数据解析工作完成以后，gatsby就会调用项目自定义的`createPages`函数，该函数的工作内容如下：（流程图）
- 请求grapql服务，拉取md列表数据
- 调用`createPage`函数，同时传入该md信息中的`slug`（用于标识页面）、模版组件等信息
- 单页面渲染，使用模版组件，获取文件的`slug`，带上`slug`请求graphql服务，拉到对应的md信息，然后将md转的html内容插入到react组件中
- 内部调用`renderToStaticNodeStream` api将React当作静态页面生成器来使用，最终会生成一个可读流输出的html，并将这个html存放起来

### 结果展示

### 网页动态数据
网页中难免会遇到请求服务器的需求，这时，我们依旧可以按照之前的开发方式，使用ajax或者fetch进行接口请求，我们可以看下demo中的comment组件。

## 部署
我们完全可以将网页内容放到服务提供商提供的对象存储服务上，不需要额外的管理和修补服务器的框架，减少了开销并提升了安全性。  
同时再为对象存储接入CDN，让网站页面资源能够更快触达用户。  
这些步骤我们都可以交给CI工具帮我完成。

![](https://static001.infoq.cn/resource/image/75/c8/7529769a2c7b4714ba0ef913c25f68c8.png)

## 适用性
接下来我们看下JAMStack相对于相对于客户端渲染（CSR）和服务端渲染（SSR）有什么区别。
- 相对于客户端渲染（CSR）：SSG的Time to first byte(TTFB，第一字节时间)性能更好（最小化第一个字节的时间）；同时因为构建的时候就已经将网页内容写入网页资源，seo也更加友好
- 服务端渲染（SSR）相对于，SSG部署更简单，直接将资源发到cdn就行了，不需要node server动态渲染页面

在构建博客网页中。使用SSG技术方案，最终生成的产物为静态网页，用户在访问网页的时候，可以直接从静态存储服务中获取资源；使用SSR技术方案，生成的网页内容展示依赖于后台响应的数据，用户请求网页服务的时候，服务器需要请求资源和渲染页面这两步操作，当该服务访问量增大，在不升级服务端资源的前提下用户体验也会随之变差；

### 优点
- 高性能：最终构建出来的产物是静态网页，用户访问网页的时候，没有额外的数据请求，可以直接将静态网页资源返回
- 易开发：react(next.js、gatsby)、vue(nuxtjs、vitepress)、angular(scully)三大框架都有对应的ssg解决方案
- 易部署：不需要部署额外的web server，网页资源直接托管到静态资源服务上，不会太要求开发人员的运维能力
- 即时性：能够即时将缓存失效，当网页资源发布后，用户能够立即看到最新的内容
- 强安全：由于不需要web server，JAMStack网站可被攻击的点相对来说更少
- 易扩容：访问量增多，cdn可以自动扩充流量

### 缺点
- 缺乏动态能力：不能很好的处理需要动态化数据的网页。如果平台内容来自于第三方用户，如果使用JAMStack，当用户新建或者修改文档的时候，都将重新构建内容。
- 高度依赖第三方系统：高度依赖第三方系统意味着如果这些系统崩溃，那么 JAMStack 应用也会崩溃

### 适用范围


