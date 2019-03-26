该小程序中需要封装的业务逻辑有如下：

- loading 效果
- 实现自动登录效果
- 将用户登录信息统一通过 sessionId 请求头传到后端
-  对后端响应的状态码统一处理

我们发起网络请求还是用的 wx.request api

## 统一处理 loading 效果

```
// 为数组添加删除某一个值的方法
Array.prototype.delete = function(val) {
  while (this.indexOf(val) > -1) {
    const index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  }
};
// 接口地址
const BASE_URL = "https://tec.hrout.com";
// 有的请求不需要添加 loading 效果，这里用数组来存放这类地址
const notLoading = ["/api/custom/company/getCompanyList"];
// 我们使用数组来存放还处于请求中的接口
const waittings = [];
// 当某个请求完成的时候就需要删除等待数组中完成的请求
const detection = val => {
  waittings.delete(val);
  // 如果 waittings 中没有元素了，表示没有请求了
  if (waittings.length === 0) {
    wx.hideLoading();
  }
};

const request = options => {
  const { url } = options;
  // 如果是需要显示 loading 效果的请求就放入请求数组中
  if (!notLoading.includes(url)) {
  	// 将该请求存放到 loading 中
    waittings.push(url);
    // 这里登录接口单独用一种 loading 内容，所以这里做了判断
    if (url !== "/api/user/userLogin") {
      wx.showLoading({
        title: "加载中",
        mask: true
      });
    }
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: `${BASE_URL}${url}`,
        success: () => {},
        fail: () => {},
        // 当请求完成后将 waittings 中的关于该请求删除
        complete: () => {
           detection(url);
        }
      });
    })
  }
}

export default request;
```

## 自动登录

当用户未登录的时候后端会返回 code 码为 -2。

```
// request.js
...
const request = options => {
  ...
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header: options.header,
      url: `${BASE_URL}${url}`,
      success: res => {
        switch (res.data.code) {
          // code 为 -2 表示未登录或者登录过期
          case -2:
            {
              wx.removeStorageSync("sessionId");
              wx.showLoading({
                title: "登录中",
                mask: true
              });
              require("./login.js")();
            }
            break;
          ...
        }
      }
    })
  })
}
module.exports = request;
```

````
// login.js
const login = () => {
	// 判断用户是否授权
  wx.getSetting({
    success: res => {
      if (res.authSetting["scope.userInfo"]) {
        require('./register')();
      } else {
        console.log("用户未授权获取用户信息");
      }
    },
    fail: error => {
      console.log("获取授权信息错误", error);
    }
  });
};

module.exports = login;
````

```
// register.js
// 这里后端为了能够检测到用户是否第一次登录，所以这里登录的时候我们都调用 wx.getUserInfo 去获取用户的一些个人信息，调用该方法前必须调用 wx.login
const userApi = require("../service/user.js");
const register = () => {
  wx.login({
    timeout: 5000,
    success: res => {
      if (res.code) {
        const code = res.code;
        // 调用该方法获取用户的一些个人信息
        wx.getUserInfo({
          withCredentials: true,
          success: res => {
            const { iv, encryptedData, userInfo } = res;
            // 带着用户的一些账号信息请求后端的登录接口
            userApi.login({
                code,
                iv,
                encryptedData,
                ...userInfo
              })
              // 对登录请求的响应进行处理
              .then(res => {
                if (res.data.code === 0) {
                  // 将标志用户登录的信息写入微信缓存中
                  wx.setStorage({
                    key: "sessionId",
                    data: res.data.data.sessionId
                  });
                  wx.hideLoading();
                  wx.showToast({
                    title: "登录成功",
                    icon: "success",
                    duration: 1000
                  });
                }
              })
              .catch(err => {
                console.log("登录失败", err);
              });
          }
        });
      } else {
        console.log("登录失败", res.code);
      }
    },
    fail: error => {
      console.log("code获取失败", error);
    }
  });
};

module.exports = register;
```



