# nginx location配置

编写本文时，使用的nginx版本为nginx/1.17.9和nginx/1.16.1

## 路由匹配规则

location路由匹配的大致规则：`location [=|^~|~|~*|@] path { ... }`

如果大家对这块内容比较熟悉了，可以直接到[优先级疑惑点](#优先级疑惑点)这里看一个比较奇怪的匹配逻辑。

### 精确匹配（=）

location配置的path和客户端请求的path完全一致时匹配成功。
匹配成功后，nginx就会停止搜索其他匹配项。

```
server {
  listen 2020;

  location = /test {
    return 200 '=';
  }
}
```
- 请求`localhost:2020/test`，匹配成功，响应内容为"="
- 请求`localhost:2020/test?num=1`，匹配成功，响应内容为"="
- 请求`localhost:2020/test/`，匹配失败，响应状态码404
- 请求`localhost:2020/test/1`，匹配失败，响应状态码404

### 前缀匹配（^~）

location配置的path为客户端请求的path前缀时匹配成功。
匹配成功后，nginx还会判断是否存在后面这种情况{(location修饰符为`^~` || location没有修饰符) && location配置的path是客户端请求的前缀}，如果存在，就使用匹配项最多的作为最后的匹配结果。

```
server {
  listen 2020;

  location ^~ /test {
    return 200 '^~';
  }
}
```
- 请求`localhost:2020/test`，匹配成功，响应内容"^~"
- 请求`localhost:2020/test/1`，匹配成功，响应内容"^~"
- 请求`localhost:2020/test111`，匹配成功，响应内容"^~"
- 请求`localhost:2020/tes`，匹配失败，响应状态码404

```
server {
  listen 2020;

  location ^~ /test {
    return 200 '/test';
  }

  location ^~ /test/1 {
    return 200 '/test/1';
  }
}
```
- 请求`localhost:2020/test`，匹配成功，响应内容"/test"
- 请求`localhost:2020/tes`，匹配成功，响应内容"/test"
- 请求`localhost:2020/test/1`，匹配成功，响应内容"/test/1"。这里两个location配置都匹配上了，第一个location匹配项为1，第二个location匹配项为2，由于nginx选用匹配项最多的location，所以响应内容"/test/1"。

### 正则匹配（~ 和 ~*）

修饰符`~`，正则匹配区分大小写。修饰符`~*`，正则匹配不区分大小写。
正则匹配以location在文件中的定义顺序从上到下进行匹配。匹配成功以后，nginx就停止搜索其他匹配项。

>注意：mac os文件系统大小写不敏感，因此nginx服务配置的location path不区分大小写，nginx使用~和~*效果是一样的。linux文件系统大小写敏感，因此nginx服务区分大小写，nginx使用~和~*效果与前面介绍的效果一致。

#### ~例子
```
server {
  listen 2020;

  location ~ /test_a {
    return 200 '~';
  }
}
```
- 请求`localhost:2020/test_a`，匹配成功，响应内容"~"
- 请求`localhost:2020/test_A`，匹配成功和失败都有可能，得看nginx服务所在的系统对于大小写是否敏感。mac os系统下，匹配成功，响应内容"~"；linux系统下，匹配失败，响应状态码404。

#### ~*例子
```
server {
  listen 2020;

  location ~* /test_a {
    return 200 '~*';
  }
}
```
- 请求`localhost:2020/test_a`，匹配成功，响应内容"~*"
- 请求`localhost:2020/test_A`，匹配成功，响应内容"~*"

### 优先级

>注：优先级从上到下依次递减。

1. 精确匹配（=）
2. 前缀匹配（^~）
3. 正则匹配（~和～*）
4. 通配符路径（没有任何修饰符，只有一个通配符路径"/"）

下面我们使用不同的location配置组合来匹配`location:2020/test_a`这个请求。

```
server {
  listen 2020;

  location ^~ /test_a {
    return 200 '^~';
  }

  location = /test_a {
    return 200 '=';
  }
}
```
- 请求`localhost:2020/test_a`，匹配成功，响应内容"="，精确匹配优先级比前缀匹配优先级大

---

```
server {
  listen 2020;

  location ~ /test_a {
    return 200 '~';
  }

  location ^~ /test_a {
    return 200 '^~';
  }
}
```
- 请求`localhost:2020/test_a`，匹配成功，响应内容"^~"，前缀匹配优先级比正则匹配优先级大

---

```
server {
  listen 2020;
  
  location / {
    return 200 '/';
  }

  location ~ /test_a {
    return 200 '~';
  }
}
```
- 请求`localhost:2020/test_a`，匹配成功，响应内容"~"，正则匹配优先级比通配符优先级大

### 优先级疑惑点
```
server {
  listen 2020;

  location ^~ /test {
    return 200 '~';
  }
  
  location /test/a {
    return 200 'null';
  }
}
```
- 请求`localhost:2020/test/a`，匹配成功，响应内容"null"，可以知道第二个location配置优先级比前缀优先级大，这个在前面[前缀匹配](#前缀匹配（^~）)有介绍。

---

我们将配置改成下面这个内容：
```
server {
  listen 2020;
  
  location /test {
    return 200 'null';
  }

  location ^~ /test {
    return 200 '~';
  }
}
```
然后运行` nginx -t`来检测配置文件是否正确，得到的结果是：`nginx: [emerg] duplicate location "/test" in ...`，这里的意思是路径为`/test`的location重复了。看到这里，原本以为"^~"是nginx定义location时默认的修饰符，但是，实际可能并不是，我们看下面的例子。

--- 

```
server {
  listen 2020;
  
  location ~ /test {
    return 200 '~';
  }
  
  location /test/a {
    return 200 'null';
  }

  location ^~ /test {
    return 200 '~';
  }
}
```
- 请求`localhost:2020/test/a`，匹配成功，响应内容"~"（what？为什么返回的不是"null"），这里三个都匹配上了，但是nginx选用的是正则匹配结果，这个我不知道是什么原因，如果有大佬知道原因，还请大佬帮忙解惑。

## location常用的参数

### root & alias

两个参数都是用来指定文件路径。

>注：之前很多文章都表示alias配置的路径最后必须加上"/"，这个到现在已经不适用了。我测试的时候，alias配置的路径最后不添加"/"，一样可以正常使用。

#### 最终指向的文件路径区别
- root指向的文件实际路径：root+location
- alias指向的文件实际路径：alias

```
server {
  listen 2020;
  
  location /test {
    root /data;
  }
}
```
最终指向的文件路径为`/data/test`。

```
server {
  listen 2020;
  
  location /test {
    alias /data;
  }
}
```
最终指向的文件路径为`/data`;

使用上面的配置，我们发起请求`localhost:2020/test/1.png`。
- root配置，该请求查找的文件路径为`/data/test/1.png`
- alias配置，该请求查找的文件路径为`/data/1.png`

#### 定义位置区别
- root可以在http、server、location、if中定义内容
- alias只能在location中定义

root在http、server定义以后，location会默认继承上层定义的内容，可以在location中使用root对上层root定义进行重写，或者使用alias让上层root在该lcation中失效。

#### 正则匹配时定义区别
- root：按照前面说的方式使用
- alias：需要将正则匹配的内容添加到alias定义的路径后面，具体的例子如下

```
server {
  listen 2020;
  
  location ~ /test {
    alias /data;
  }
}
```
请求`localhost:2020/test/1.png`，匹配成功，但是没有找到文件内容，响应404

```
server {
  listen 2020;
  
  location ~ /test(.*)$ {
    alias /data$1;
  }
}
```
请求`localhost:2020/test/1.png`，匹配成功，能够正常返回文件

### proxy_pass

该参数用作反向代理，可以用来做负载均衡、前端解决跨域等功能。使用结构`proxy_pass url`。

关于proxy_pass实现负载均衡，可以在[nginx负载均衡](https://github.com/duanyuanping/Blog/issues/26)中看到相关内容。

proxy_pass转发请求，配置的url最后是否有"/"，会呈现不同的效果。

```
server {
  listen 2020;
  
  location /api/ {
    proxy_pass http://localhost:7001;
  }
}
```
请求`localhost:2020/api/component/list`，nginx会将该请求代理转发到`http://locahost:7001/api/component/list`。  
应用场景：前端请求存在跨域，后端接口格式是`api/业务路由`，前端请求的接口也是`api/业务路由`。

```
server {
  listen 2020;
  
  location /api/ {
    proxy_pass http://localhost:7001/;
  }
}
```
请求`localhost:2020/api/component/list`，nginx会将该请求代理转发到`http://locahost:7001/component/list`。  
应用场景：后端接口格式是`业务路由`，前端请求的接口是`api/业务路由`，前端请求的接口前面加一个"api"是为了标识某个后端服务，后端接口中并没用这个标识。

---

```
server {
  listen 2020;
  
  location /api/ {
    proxy_pass http://localhost:7001/online;
  }
}
```
请求`localhost:2020/api/component/list`，nginx会将该请求代理转发到`http://locahost:7001/onlinecomponent/list`。
应用场景：没遇到这样的场景，一般都会用都会用"/"隔开路径。

```
server {
  listen 2020;
  
  location /api/ {
    proxy_pass http://localhost:7001/online/;
  }
}
```
请求`localhost:2020/api/component/list`，nginx会将该请求代理转发到`http://locahost:7001/online/component/list`。

### rewrite

rewrite参数用来将客户端请求重定向到一个新的地址。使用格式`rewrite regex replacement [flag];`
- regex（必填）：正则匹配，只有正则匹配成功后，才能进行地址修改等后续步骤
- replacement（必填）：新的url（以`http://` `https://` `$schema`等开头）或者uri，正则匹配成功后会用这个值替换原来的请求地址。当replacement值是url时，客户端请求发生重定向，因此会有两次请求，第一次请求是客户端原请求，响应的状态码为302，第二次请求的地址就是replacement值，本次rewrite逻辑运行完成以后，后续的rewrite不再匹配；当replacement值为uri时，客户端请求可能发生重定向，是否发生重定向与flag参数有关
- flag（可选）
  - break：本条rewrite逻辑运行完成以后，后续的rewrite不再匹配
  - last：本条rewrite逻辑运行完成以后，后续的rewrite不再匹配，重新开始location路由匹配
  - permanent：永久重定向，301
  - redirect：临时重定向，302
  
下面展示几个例子：

```
server {
  listen 2020;
  
  location / {
    rewrite /(.*) https://www.$1.com;
  }
}
```
请求`localhost:2020/baidu`，请求被重定向到`https://www.baidu.com`。

```
server {
  listen 2020;
  
  location / {
    rewrite (.*) https://www.baidu.com;
    rewrite (.*) https://www.github.com;
  }
}
```
请求`localhost:2020`，请求被重定向到`https://www.baidu.com`，查看network，里面有一条`http://localhost:2020/`请求，响应的状态码为302，还以一条`https://www.baidu.com/`请求。

---

```
server {
  listen 2020;
  
  location / {
    rewrite (.*) /test redirect; # permanent也是可以的
  }
  
  location /test {
    return 200 'ok';
  }
}
```
请求`localhost:2020`，请求被重定向到`http://localhost:2020/test`，network中有两条请求分别是响应状态码302（flag值为permanent时，状态码为301）的`http://localhost:2020/`请求和响应状态码为200的`http://localhost:2020/test`请求。

---

flag值为break或last都会终止后续rewrite匹配（不会终止proxy_pass等逻辑），两者不同的点是，break不会发起一轮新的location路由匹配，而last会发起一轮新的location匹配。

```
server {
  listen 2020;
  
  location /last {
    rewrite /last(.*) /test1;
    rewrite /test1(.*) /test2 last;
    rewrite /test2(.*) /test3;
  }
  
  location /break {
    rewrite /break(.*) /test1;
    rewrite /test1(.*) /test2 break;
    rewrite /test2(.*) /test3;
  }

  location /test1 {
    return 200 'test1';
  }

  location /test2 {
    return 200 'test2';
  }

  location /test3 {
    return 200 'test3';
  }
}
```
- 请求`localhost:2020/last`，响应内容"test2"。这个请求被`location /last {...}`匹配成功，因为`rewrite /test1(.*) /test2 last`这里flag为last，所以这条rewrite逻辑运行完以后，就会忽略后续的rewrite，然后重新location路由匹配，重新匹配时请求变成`http://localhost:2020/test2`，因此会被`location /test2 {}`这条location匹配，所以响应内容为"test2"。
- 请求`localhost:2020/break`，响应状态码为404。这个请求被`location /break {...}`匹配成功，因为`rewrite /test1(.*) /test2 break`这里flag为break，所以这条rewrite逻辑运行完以后，就会忽略后续的rewrite，执行完当前location后还是没有找到资源文件，因此返回状态码"404"。

将上面例子中`location /break {...}`这部分内容修改一下，修改成如下内容：
```
location /break {
    rewrite /break(.*) /test1;
    rewrite /test1(.*) /test2 break;
    rewrite /test2(.*) /test3;
    
    proxy_pass http://localhost:2020;
}
```
- 请求`localhost:2020/break`，响应内容"test2"，rewrite语句中flag值为break，不会影响proxy_pass语句，因此`localhost:2020/break`实际会代理转发到`localhost:2020/test2`这个地址。

如果rewrite部分内容没有看懂，可以到[搞懂nginx的rewrite模块](https://segmentfault.com/a/1190000008102599)查看更详细的介绍。

### index

index用于指定网站的起始页面，默认值`index index.html;`。

index参数只是用来指定文件的路径，nginx根据index参数查找文件是否存在，如果存在就用文件路径拼接成新的url，nginx内部重定向到这个新的url，来获取到起始页面资源。下面用具体的例子来进行说明（/data/test目录下有一个index.html文件）：

```
server {
  listen 2020;
  
  location / {
    root /data/test;
    index index.html;
  }
}
```
请求`localhost:2020`，响应内容为文件`/data/test/index.html`内容。

下面对配置文件添加一些内容，用来匹配html文件请求：
```
server {
  listen 2020;
  
  location / {
    root /data/test;
    index index.html;
  }
  
  location ~ \.html$ {
    return 200 'html文件请求拦截';
  }
}
```
请求`localhost:2020`，响应内容"html文件请求拦截"。这个例子很好的说明nginx内部会将初始页文件路径生成一个新的url，nginx内部重定向到这个新的url请求初始页文件。

---

index后面可以跟多个文件路径，当前一个文件不存在时，nginx会自动判断后面文件是否存在。下面使用一个例子来展示（/data/test目录下只有idnex.php文件）：

```
server {
  listen 2020;
  
  location / {
    root /data/test;
    index index.html index.php;
  }
}
```
请求`localhost:2020`，nginx会首先判断文件`/data/test/index.html`是否存在，如果存在，就使用这个文件路径来生成新的文件url，然后nginx内部重定向到这个文件资源；如果不存在，就判断`/data/test/index.php`文件是否存在，如果不存在就返回403，如果存在，就使用这个文件路径来生成新的文件url，然后nginx内部重定向到这个文件资源。
