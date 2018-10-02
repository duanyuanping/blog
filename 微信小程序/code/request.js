// 封装 Array 中的 delete 方法，用来直接删除数组中的某个值
Array.prototype.delete = function(val) {
  while (this.indexOf(val) > -1) {
    const index = this.indexOf(val);
    if (index > -1) {
      this.splice(index, 1);
    }
  }
};
// 接口网址
const BASE_URL = "https://test.duan.com";
// 不需要 loading 效果的请求
const notLoading = ["/api/custom/company/getCompanyList"];
// 存放所有还未完成的请求
const waittings = [];
// 删除已完成的请求并检测 waittings 中是否还有未请求完的数组
const detection = val => {
  waittings.delete(val);
  if (waittings.length === 0) {
    wx.hideLoading();
  }
};
const request = options => {
  // 用户登录标识
  const sessionId = wx.getStorageSync("sessionId");
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
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header: {
        ...options.header,
        sessionid: sessionId
      },
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
      fail: res => {
        reject(res);
      },
      complete: () => {
        detection(url);
      }
    });
  });
};

module.exports = request;
