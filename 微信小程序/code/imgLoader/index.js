Component({
  properties: {
    defaultUrl: {
      type: String,
      value: "http://testduan.oss-cn-beijing.aliyuncs.com/small.jpg",
    },
    originUrl: {
      type: String,
      value: "http://testduan.oss-cn-beijing.aliyuncs.com/large.jpg",
    },
  },
  data: {
    finish: false,
  },
  externalClasses: ["image-wrap"],
  methods: {
    loadsuccess: function () {
      this.setData({
        finish: true,
      });
    },
    loaderror: function () {
      this.setData({
        finish: false,
      });
    },
  }
})
