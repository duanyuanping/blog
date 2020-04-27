## 使用server_name
本地开发时，如果需要使用nginx的server_name来定义域名，我们这里假设需要请求的域名是`www.test.com`，具体步骤如下：
- 首先需要修改系统host文件，让这个域名下的请求全部解析到本机，修改的host文件地址`/etc/host`，向该文件添加如下内容`127.0.0.1 www.test.com`（如果不配置这一步，nginx如何配置，www.test.com请求都不会解析到本机的nginx）
- 修改nginx config文件，配置`server_name www.test.com;`，重载配置后，就能够正常使用了。

通过域名请求一个nginx服务，浏览器会先通过域名解析服务器获取到域名指向的服务器地址，浏览器请求该服务器下的响应资源。上面例子中如果没有配置第一个步骤内容，域名解析服务器没有找到该域名指向的服务器地址，因此浏览器一直报找不到该域名指向的服务器地址。本机host文件指定域名解析的ip地址后，dns域名解析流程中检测本机host文件配置步骤就能够拿到域名指向的ip，因此浏览器能够请求到本机的nginx服务。

[dns域名解析具体流程](https://github.com/duanyuanping/Blog/blob/master/%E8%AE%A1%E7%BD%91/DNS%E5%9F%9F%E5%90%8D%E8%A7%A3%E6%9E%90.md)


