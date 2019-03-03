

webpack 配置代码分离

- webpack4 配置 optimization 属性（默认提出 node_module 中的文件）
- 之前的配置 webpack.optimize.CommonsChunkPlugin 插件（需要自己选提出哪些文件）
- 将图片文件单独提取出来

nginx 配置对打包好的文件进行 gzip 压缩后，再传输

将公共文件提取到第三方存储库中

将一些工具库打包文件设置浏览器缓存

