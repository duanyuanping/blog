1. 浏览器地址栏输入url（如 www.example.com）
2. 浏览器检测用户输入的 url 格式是否正确。并补齐 url，前面给出的 url 没有给出协议，默认使用 http 协议补全
3. 浏览器解析 url，获取协议、主机、端口、路径
4. 浏览器检测本地缓存是否存在
   1. 存在本地缓存，检测缓存的强缓存是否有效
      1. 强缓存有效，直接跳到第 14 步
      2. 强缓存无效，在[浏览器协商缓存](https://github.com/duanyuanping/blog/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8/%E6%B5%8F%E8%A7%88%E5%99%A8%E8%B5%84%E6%BA%90%E7%BC%93%E5%AD%98.md)中讲述了的后面的步骤
   2. 不存在本地缓存，进行下一步
5. [DNS 解析](https://github.com/duanyuanping/blog/blob/master/%E8%AE%A1%E7%BD%91/DNS%E5%9F%9F%E5%90%8D%E8%A7%A3%E6%9E%90.md)，得到域名解析后的 ip（这一步如果前面协商缓存，就会触发）
6. 客户端与ip指向的服务端建立TCP连接，[三次握手](https://github.com/duanyuanping/blog/blob/master/%E8%AE%A1%E7%BD%91/34%E3%80%81TCP%20%E6%95%B0%E6%8D%AE%E4%BC%A0%E8%BE%93.md#%E4%B8%89%E6%AC%A1%E6%8F%A1%E6%89%8B)
7. 如果是http请求，TCP连接成功后，就将请求内容发送给服务端；如果是https，在数据发送前还需要进行https连接
8. 服务器TCP接收请求内容以后，将请求内容传给应用层服务处理
9. 应用层服务读取请并准备好响应内容
10. 服务器响应内容通过TCP连接发送给浏览器
11. 浏览器收到响应内容后，然后根据情况进行[四次挥手](https://github.com/duanyuanping/blog/blob/master/%E8%AE%A1%E7%BD%91/34%E3%80%81TCP%20%E6%95%B0%E6%8D%AE%E4%BC%A0%E8%BE%93.md#%E5%9B%9B%E6%AC%A1%E6%8C%A5%E6%89%8B)
12. 检测状态码，是否为 1xx、3xx（前面协商或者网页定向）、4xx、5xx，这些与 2xx 处理情况不同
13. 检测请求的资源是否可以缓存
14. 对响应的内容进行解压（例如 gzip 解压）
15. 渲染进程解析html文档，解析文档中是否存在其他资源加载，将需要加载的资源交给浏览器主进程进行加载。（页面渲染这一块在 [渲染进程](https://github.com/duanyuanping/blog/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%A4%9A%E8%BF%9B%E7%A8%8B%E5%92%8C%E5%A4%9A%E7%BA%BF%E7%A8%8B.md#renderer-%E8%BF%9B%E7%A8%8B%E9%A1%B5%E9%9D%A2%E6%B8%B2%E6%9F%93gui-%E6%B8%B2%E6%9F%93%E7%BA%BF%E7%A8%8B) 中有讲）
16. 渲染进程GUI线程将render tree在页面中渲染出来