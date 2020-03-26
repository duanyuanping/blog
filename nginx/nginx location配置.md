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
- 请求`location:2020/test`，匹配成功，响应内容为"="
- 请求`location:2020/test?num=1`，匹配成功，响应内容为"="
- 请求`location:2020/test/`，匹配失败，响应状态码404
- 请求`location:2020/test/1`，匹配失败，响应状态码404

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
- 请求`location:2020/tes`，匹配失败，响应状态码404

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

### 正则匹配（~和~*）

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
- 请求`location:2020/test_a`，匹配成功，响应内容"="，精确匹配优先级比前缀匹配优先级大

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
- 请求`location:2020/test_a`，匹配成功，响应内容"^~"，前缀匹配优先级比正则匹配优先级大

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
- 请求`location:2020/test_a`，匹配成功，响应内容"~"，正则匹配优先级比通配符优先级大

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
- 请求`location:2020/test/a`，匹配成功，响应内容"null"，可以知道第二个location配置优先级比前缀优先级大，这个在前面[前缀匹配](#前缀匹配（^~）)有介绍。

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
- 请求`location:2020/test/a`，匹配成功，响应内容"~"（what？为什么返回的不是"null"），这里三个都匹配上了，但是nginx选用的是正则匹配结果，这个我不知道是什么原因，如果有大佬知道原因，还请大佬帮忙解惑。
