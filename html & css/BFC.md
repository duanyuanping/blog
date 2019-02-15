# BFC（块级格式化上下文）

BFC 元素不会对其他元素有任何影响（不会出现 margin 重叠），不管内部元素怎么变化，对外部的元素都不会有任何影响，因此 BFC 可以用来清除浮动。

BFC 触发情况：

- html 元素
- float 的值不为 none
- overflow 为 auto、scroll、hidden
- display 为 inline-block、table-cell、table-caption
- position 为 fixed、absolute

清浮动其他常用的方法：

```
.wrap {
  zoom: 1;
}
.wrap::after {
  content: '';
  display: block;
  clear: both;
}
```

