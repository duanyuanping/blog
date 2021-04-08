![](https://img-blog.csdnimg.cn/20190825205936881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Fsenp3,size_16,color_FFFFFF,t_70)

- 客户端向服务端发起https连接
- 服务端返回SSL证书（CA证书）（证书中包含公钥）
- 客户端将SSL证书（CA证书）给权威认证机构鉴定是否有效（图中缺少这一步）
- 客户端产生随机密钥（对称密钥）
- 客户端使用公钥将刚产生的对称密钥加密
- 客户端将加密后的内容发送给服务端
- 服务端使用本地私钥解密，获得客户端对称密钥
- 服务端响应客户端已经拿到对称密钥了
- 客户端发送请求，并将请求内容使用对称密钥进行加密
- 服务端使用对称密钥将请求解密，然后进行后续的业务处理

上面流程中有使用到CA证书，这里介绍下证书获取流程
![](https://img-blog.csdnimg.cn/20190825210112772.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Fsenp3,size_16,color_FFFFFF,t_70)
- 服务器将本地的公钥发送给权威认证机构
- 权威认证机构制作数字证书（办法机构、有效期、公钥等信息），返还给服务端
- 客户端向服务端发起https连接
- 服务端将SSL证书（CA证书）响应给客户端

域名服务提供商一般都会提供SSL证书（CA证书）申请，我们建站时，先生成一对公私钥，然后带着刚生成的公钥，使用域名服务商提供的SSL证书（CA证书）申请页面进行申请证书。

学习地址：
- [分分钟让你理解HTTPS](https://juejin.im/post/5ad6ad575188255c272273c4)
- [HTTP与HTTPS详细介绍](https://blog.csdn.net/alzzw/article/details/100067723#:~:text=HTTP%E4%B8%8EHTTPS%E4%BB%8B%E7%BB%8D,%E5%8F%B7%E3%80%81%E5%AF%86%E7%A0%81%E7%AD%89%E6%94%AF%E4%BB%98%E4%BF%A1%E6%81%AF%E3%80%82)