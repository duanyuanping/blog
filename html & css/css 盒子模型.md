css 盒子模型有两种模型，分别为 IE 盒子模型和 W3C 盒子模型，这两这的区别在于盒子宽高计算的内容不同。

## IE 盒子模型

宽高计算为 content + padding + border

ie8 及其以下版本浏览器在文档中不写 DOCTYPE 就会使用 IE 盒子模型的计算方式

## W3C 盒子模型

宽高计算 content

## box-sizing

用于改变计算盒子宽高的方式，可以设置的值有 border-box、content-box、padding-box（只在 Firefox 50 前实现过，没必要使用）

### content-box

默认值，宽高计算只包含 content

### border-box

设置以后盒子宽高计算的方式就会和 IE 盒子模型一样

### 应用场景

一、

表单、普通按钮和提交按钮想要宽度都占满父容器，设置 `width: 100%;` 

![运用场景一](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/box-sizing%E5%9C%BA%E6%99%AF%E4%B8%80.jpg)

表单盒子默认是 content-box，而按钮和提交按钮默认是 border-box，因此这里离我们将表单元素设置 `box-sizing: border-box;`

二、

当想要父容器中排布多个栏目时

```
<div class="parent">
  <div class="fir"></div>
  <div class="sec"></div>
</div>

.parent {
  width: 300px;
  height: 300px;
}
.parent div {
  float: left;
}
.fir {
  width: 60%;
  height: 50px;
  border: 10px solid red;
}
.sec {
  width: 40%;
  height: 50px;
  border: 10px solid orange;
}
```

这里由于子元素不设置 `box-sizing：border-box;` 两个子元素实际总共占的宽度大于父元素的宽，导致第二个子元素被挤到下一列排布。

![场景二](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/box-sizing%E5%9C%BA%E6%99%AF%E4%BA%8C.jpg)