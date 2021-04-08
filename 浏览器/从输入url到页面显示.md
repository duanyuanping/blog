1. 浏览器地址栏输入url（如 www.example.com）
2. 浏览器检测用户输入的 url 格式是否正确。并补齐 url，前面给出的 url 没有给出协议，默认使用 http 协议补全
3. 浏览器解析 url，获取协议、主机、端口、路径
4. 浏览器检测本地缓存是否存在
   1. 存在本地缓存，检测缓存的强缓存是否有效
      1. 强缓存有效，直接跳到第 14 步
      2. 强缓存无效，在[浏览器协商缓存](https://github.com/duanyuanping/True-in-Hong/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8/%E6%B5%8F%E8%A7%88%E5%99%A8%E8%B5%84%E6%BA%90%E7%BC%93%E5%AD%98.md#user-content-%E5%8D%8F%E5%95%86%E7%BC%93%E5%AD%98)中讲述了的后面的步骤
   2. 不存在本地缓存，进行下一步
5. [DNS 解析](https://github.com/duanyuanping/True-in-Hong/blob/master/%E8%AE%A1%E7%BD%91/DNS%E5%9F%9F%E5%90%8D%E8%A7%A3%E6%9E%90.md)，得到域名解析后的 ip（这一步如果前面协商缓存，就会触发）
6. 打开一个 socket 与目标 ip 地址、端口建立 TCP 连接，[三次握手](https://github.com/duanyuanping/True-in-Hong/blob/master/%E8%AE%A1%E7%BD%91/34%E3%80%81TCP%20%E6%95%B0%E6%8D%AE%E4%BC%A0%E8%BE%93.md#user-content-%E4%B8%89%E6%AC%A1%E6%8F%A1%E6%89%8B)
7. TCP 连接成功，浏览器发起 HTTP 请求
8. 服务器接收请求并将其转发到对应的服务程序进行处理
9. 处理程序读取请求参数并准备 HTTP 响应
10. 服务器请求的内容通过 TCP 连接发送给浏览器
11. 浏览器收到 HTTP 响应，然后根据情况进行[四次挥手](https://github.com/duanyuanping/True-in-Hong/blob/master/%E8%AE%A1%E7%BD%91/34%E3%80%81TCP%20%E6%95%B0%E6%8D%AE%E4%BC%A0%E8%BE%93.md#user-content-%E5%9B%9B%E6%AC%A1%E6%8C%A5%E6%89%8B)
12. 检测状态码，是否为 1xx、3xx（前面协商或者网页定向）、4xx、5xx，这些与 2xx 处理情况不同
13. 检测请求的资源是否可以缓存
14. 对响应的内容进行解压（例如 gzip 解压）
15. 解析 HTML 文档，如果文档中有加载其他资源，就将加载的工作交给 Browser 进程处理。（页面渲染这一块在 [渲染进程](https://github.com/duanyuanping/True-in-Hong/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%A4%9A%E8%BF%9B%E7%A8%8B%E5%92%8C%E5%A4%9A%E7%BA%BF%E7%A8%8B.md#user-content-%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B%E6%B5%8F%E8%A7%88%E5%99%A8%E5%86%85%E6%A0%B8) 中有讲）
16. Browser 进程渲染页面