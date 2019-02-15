## link 和 @import 的区别：

- @import 是 css 提供语法；link 是 html 的标签，除了加载 css 外还可以用于加载 RSS
- link 资源会在页面文档资源解析时加载，@import 资源将在执行解析 css 的时候加载
- link 不存在兼容性问题，@import 是 css2.1 提出的，存在兼容性问题
- link 可以使用 js 进行动态引入，@import 不行

## 为什么要使用 @import：

这得知道 @import 的用法，`@import url list-of-media-queries;`，这是 @import 的官方用法，其中第三个参数是媒体查询的条件，多个条件用逗号隔开，只有当满足这些媒体查询条件的时候才会使用 url 中指定的 css（会提前加载），如下是 [mdn @import](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@import) 提供的例子：

```
@import url("fineprint.css") print;
@import url("bluish.css") projection, tv;
@import 'custom.css';
@import url("chrome://communicator/skin/");
@import "common.css" screen, projection;
@import url('landscape.css') screen and (orientation:landscape);
```

为了性能考虑尽量使用 link 来加载 css 文件。

