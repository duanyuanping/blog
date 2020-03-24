# nginx location配置

## 路由匹配规则

location路由匹配的大致规则：`location [=|^~|~|~*|@] path { ... }`

### =

location配置的path和客户端请求的path完全一致时匹配成功。
匹配成功后，nginx就会停止判断其他匹配。

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

### ^~

location配置的path是客户端请求的path前缀时匹配成功。
匹配成功后，nginx还会判断是否存在后面这种情况（location修饰符为`^~` && location配置的path是客户端请求的前缀），如果存在，就使用location配置的path路径最长的作为最后的匹配结果。

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
- 请求`localhost:2020/test`，响应内容"/test"
- 请求`localhost:2020/tes`，响应内容"/test"
- 请求`localhost:2020/test/1`，这里两个location配置都匹配上了，第一个location配置的path路径长度为1小于第二个location配置的path路径长度2，所以响应内容"/test/1"





