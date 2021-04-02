## offset
- `offsetParent`: 最近一个使用css定位（`position: absoluve/fixed`）了的父节点，如果没有就会返回`body`。
- `offsetWidth`、`offsetHeight`: 返回元素的宽高（width/height + border + padding），这里不包括使用`overflow`而隐藏的内容。
- `offsetLeft`、`offsetTop`: 返回当前元素相对于使用过css定位（`position: absoluve/fixed`）了的父节点的位置，如果没有定位过的父节点，就相对于`body`。

## client
- `clientWidth`、`clientHeight`：返回元素宽高（width/height + padding），不包括`border`和使用`overflow`而隐藏的内容。
- `clientLeft`、`clientTop`: 返回元素节点周围边框的宽度（厚度）

## scroll
- `scrollWidth`、`scrollHeight`: 返回滚动元素内容宽高+padding，如果没有内容溢出情况下，相当于`clientWidth`、`clientHeight`。
- `scrollLeft`、`scrollTop`: 返回滚动条位置。可以通过设置这两个属性，来让元素中的内容滚动。

![](https://upload-images.jianshu.io/upload_images/11296076-f6c7c09de21c104f.png?imageMogr2/auto-orient/strip|imageView2/2/w/1125/format/webp)