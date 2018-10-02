# 封装 request

## 简述

在开发小程序中，为了请求线上的数据，难免会用到 `wx.request` 这个 API。微信小程序提供的这个 API 只是用于请求接口，但是在实际业务中我们有很多其他的功能需要通过请求接口的时候来实现，例如：统一配置请求的超链接、统一请求操作错误处理、检测用户的登录状况、请求接口的时候显示 loading 效果以及 隐藏 loading 效果等等。

下面将封装后的 request 函数是为了实现统一配置请求的超链接、统一请求操作错误处理、检测用户登录状态和显示、隐藏 loading 效果。

## 配置请求超链接

其实这个没什么说的，就是将请求的地址赋给一个变量，请求的时候统一读取此变量，这样后面换了地址以后也可以很容易的进行配置。

```
const BASE_URL = "https://test.duan.com";
```

使用 `wx.request` API 的时候，传入的对象中的 url 属性可以写成如下的代码：

```
const requst = options => {
	const { url } = options;
	...
  wx.request({
    ...,
    url: `${BASE_URL}${url}`, // 这里的 option 是调用封装后的 request 函数时传入的有关此次请求头、请求体以及请求的接口路径
    ...,
  });
  ...
};
```

## 请求完成

当请求完成后，request 函数需要将接口返回给调用的地方，在这里使用的是 es6 中的 Promise 来实现异步，当请求成功就是用 Promise 的 resolve 函数 失败就调用 reject 函数。代码如下：

```
...
const request = options => {
  return new Promist((resolve, reject) => {
    wx.request({
      ...
    });
  });
}
```

## 统一请求操作错误处理

当我们请求接口成功后，后端并不是总会操作成功的，当操作失败的时候，后端会返回与成功不同的 code 码，这时前端就需要将错误的原因给用户看。或者后端规定好对应的 code 代表什么错误，然后再给用户看得懂的提示，由于我现在展示的小程序必要小，就没有去规定一个 code 对应表，这里就只是将后端返回的 msg 展示给用户。

当请求接口成功后，我们需要在 传给`wx.request` 参数对象中的 success 函数中对 code 进行检测并将错误展示出来，如下：

```
const request = options => {
	return new Promise((resolve, rejet) => {
    wx.request({
       ...,
       success: res => {
         switch (res.data.code) {
            // code 为 -2 表示未登录或者登录过期
            case -2:
              // 进行登录操作请求
              break;
            // code 为 0 表示操作成功
            case 0:
              {
                resolve(res);
              }
              break;
            // 其他均表示操作错误
            default: {
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                duration: 2000
              });
              resolve(res);
            }
          }
       },
       ...,
    });
  });
};
```

## 用户登录状态检测

由于微信小程序没有浏览器中的那种自动存放 cookie 的功能，所以在这次的小程序项目中，我们是将用户登录的状态码存入 storage 中的，这里我们用的是名为 sessionId 的缓存名。所以我们每一次请求接口的时候都需要将 storage 中的 sessionId 取出，然后将其写入请求头中（其实放哪并不重要，只要是后端商量好了的，都是可以的）。

```
cosnt request = options => {
  const sessionId = wx.getStorageSync("sessionId");
	...
  wx.request({
    ...,
    header: {
      ...options.header, // 由于请求头有其他的配置，所以这里如果调用 request 函数时使用请求头的其他参数需要将他们填入 wx.request 的 header 中
      sessionId,
    },
    ...,
  });
};
```

将用户标识的 sessionId 传给后端后，后端回去进行判断此用户是否登录有效，如果有效就返回正确的数据，如果无效就会返回相应的状态码给前端，前端根据返回时候是无效登录来判断是否需要请求登录接口，就如前面“统一请求操作错误处理”中展示的 code 为 -2 的时候：

```
// 注意此处代码是接入“统一请求操作错误处理”中 case 为 -2 的代码
// code 为 -2 表示未登录或者登录过期
...
case -2:
  {
  	// 删除失效的 sessionId
    wx.removeStorageSync("sessionId");
    wx.showLoading({
      title: "登录中",
      mask: true
    });
    // login.js 返回的是一个登录函数
    require("./login.js")();
  }
  break;
...
```

这里就不展示 login.js 做了什么了，如果想要知道 [微信小程序登录](https://github.com/duanyuanping/True-in-Hong/blob/master/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%99%BB%E5%BD%95.md)。至此，登录状态检测就差不多完成。

## 显示、隐藏 loading 效果

程序请求接口中的数据来进行展示需要一定的时间，在这段时间中我们不能够什么都不做，这样会让用户以为我们的程序卡死了，所以我们需要在请求接口的时候给用户一个 loading 效果，来让用户知道这个程序还一直在工作中。

但是这么多的请求我们怎么来确定是否所有的请求都完成了呢？

这里我们使用一个数组来存放还有哪些请求还未完成，当发出请求的时候我们就将此请求放入数组中，请求不管成功还是失败，都需要将此请求从数组中移除，相应的代码如下：

```
// 封装 Array 中的 delete 方法，用来直接删除数组中的某个值
Array.prototype.delete = function(val) {
  while (this.indexOf(val) > -1) {
    const index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  }
};
...
// 存放所有还未完成的请求
const waittings = [];
// 不需要有 loading 效果的请求
const notLoading = ["/api/custom/company/getCompanyList"];
// 删除已完成的请求并检测 waittings 中是否还有未请求完的数组
const detection = val => {
  waittings.delete(val);
  if (waittings.length === 0) {
    wx.hideLoading();
  }
};

const request = options => {
	...
	const { url } = options;
	// 如果是需要显示 loading 效果的请求就放入请求数组中
  if (!notLoading.includes(url)) {
    waittings.push(url);
    if (url !== "/api/user/userLogin") {
      wx.showLoading({
        title: "加载中",
        mask: true
      });
    }
  }
  ...
  wx.request({
    ...,
    // 请求完成（成功或失败），就删除等待数组中的元素
    complete: () => {
      detection(url);
    },
  });
  ...
}
```

上面有一个 notLoading 的数组，那个数组存放的是不需要显示 loading 效果的请求。这样统一展示隐藏 loading 效果，就不需要每次请求都去单独写 loading 效果了。

如果感觉看了觉得代码有点乱，没理清楚可以看此目录下的 code目录下的 [request.js](https://github.com/duanyuanping/True-in-Hong/blob/master/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F/code/request.js)。



