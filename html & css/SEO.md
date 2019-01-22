## 前端 SEO 优化点

- 合理的使用 title、description、keywords：三者搜索权重递减。
  - title：强调重点，网页的 title 尽量精简，不同页面使用不同的 title。使用方式 `<title>优化 SEO</title>`
  - description：网页内容的概括。使用方式`<meta name="description" content="介绍 description 的用法">`
  - keywords：列举网页的关键词。使用方式`<meta name="keywords" content="SEO,搜索引擎,html">`（现在对这个做搜索优化没有用）
- 语义化的 html 标签。语义化代码能够让搜索引擎很容易的理解网页的内容。如 header、footer、section、nav、article 等等
- 重要的内容不要使用 js 来进行添加。爬虫不会去获取 js 的内容和 js 创建的内容
- img 标签要设置 alt 属性，宽高固定的需要设置固定的值
- 提升网站的速度
- 对不需要跟踪爬行的链接使用 nofollow，以防止跟踪爬行和传递权重，如引入广告链接等。使用方式`<a href="http://example.com" rel="nofollow"></a>`（rel 用来指定当前文档与链接文档的关系）
- 少使用 iframe。搜索引擎不会抓取 iframe 中的内容

## 后端

- 统一连接：如当多个地址指向首页的时候，搜索引擎会挑一个最好的作为代表，挑出的这个可能不是你想要的。
- 301 跳转：对于网页的 url 发生改变后，需要在原地址中使用 301 来永久性跳转到新的地址，不然之前收录的权重就会没有。
- 在站点根目录放置 robots.txt 文件，来知道搜索蜘蛛允许或禁止抓取哪些内容

