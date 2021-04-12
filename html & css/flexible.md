flexible解决移动端视窗大小不同问题，主要有两部分内容：
1. 根据当前设备的dpr，动态设置meta
2. 根据当前视窗宽设置html的font-size

px2rem loader来自动将样式文件中的px转成rem，

## meta修改
```html
<!-- html中meta -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
```
```js
// 读取设备的dpr
const dpr = window.devicePixelRatio || 0;

var metaEl = doc.createElement('meta');
var scale = 1 / dpr;
metaEl.setAttribute('name', 'viewport');
metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');

document.documentElement.firstElementChild.appendChild(metaEl);
```

## html font-size
```js
const docEl = document.documentElement;

// set 1rem = viewWidth / 10
function setHtmlFontSize(unit) {
  docEl.style.fontSize = docEl.clientWidth / 10 + 'px';
}

setHtmlFontSize(remUnit);
```

## px2rem
```js
{
  loader: "px2rem-loader",
  options: {
    // 定义rem基准，设计稿的宽 / 10
    remUnit: remUnit || 75,
    remPrecision: remPrecision || 8 // 小数点精度
  }
}
```