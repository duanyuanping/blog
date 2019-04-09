为了让资源文件在网络中传输速率更快，在服务器传输之前会将资源文件进行 gzip、defalte 等等算法进行压缩。

## 客户端和服务器端

客户端请求服务器资源的时候会使用 `accept-encoding：gizp, deflate; ` 来定义允许服务器压缩的方式，服务器收到这个请求的时候会以原来配置的形式对文件进行压缩（配置的压缩方式被客户端允许），然后在响应客户端时在响应头中写入 `content-encoding: gzip;` 来告诉客户端资源文件的压缩形式，客户端收到资源然后根据 `content-encoding` 提供的方法来对资源进行解压。

## gzip 打包浅析

### LZ77 算法压缩

如果文件中有相同内容的地方，后面的内容就使用前一块内容的位置来替换。可以使用两者之间的距离和相同内容的长度，来标明后面相同的内容的值。替换的位置信息大小要小于被替换的内容的大小（如果大了或者相等那何必替换呢）。

例子如下（内容来自 https://blog.csdn.net/imquestion/article/details/16439）：

```
压缩前的文本内容如下：
http://jiurl.yeah.net http://jiurl.nease.net

LZ77 算法匹配到的相同的内容如（）中的内容：
http://jiurl.yeah.net (http://jiurl.)nease(.net)

压缩后的内容：
http://jiurl.yeah.net (22,13)nease(23,4)
22 和 23 是相同内容与当前位置之间的距离
13 和 4 表示的是相同内容的长度
```

#### 寻找相同的内容块

利用一个滑动窗口，这个滑动窗口是由后面两个区域组成：定义搜索缓冲区（search buffer）和待编码缓冲区（lookahead buffer）。

定义搜索缓冲区和待编码缓冲区这两个区域的大小（同时也是设置滑动窗口的大小）

具体步骤见如下网址进行了解：https://www.cnblogs.com/junyuhuang/p/4138376.html



学习地址：

[gzip 原理与实现](https://blog.csdn.net/imquestion/article/details/16439)