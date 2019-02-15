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

对于表单元素中的 input、textarea 这两个元素，如果想要让这个两个元素横向铺满整个父容器，我们设置 `display: block;` 是没有用的，我们能做的就是使用 `width: 100%;` ，这样我们就有一个问题就是，这两个元素本身是由 border 的，所以他们宽度会超出父容器，因此我们这里设置他们 `box-sizing: border-box;`

![运用场景一](http://testduan.oss-cn-beijing.aliyuncs.com/blog-img/box-sizing%E5%9C%BA%E6%99%AF%E4%B8%80.jpg)

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