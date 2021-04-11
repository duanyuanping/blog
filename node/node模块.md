## node模块分类
node中的模块
- 核心模块（node 编写）
- 文件模块（用户编写）

部分 node 核心模块会在编译过程时，编译进二进制执行文件。node 进程启动时，部分核心模块会被直接加载进内存中。在应用中引入这部分的模块就会省略掉路径分析、文件定位、编译执行，因此它的加载速度很快，当如果有自定义模块的加载标识符和核心模块的加载标识符一样的时候，自定义模块会加载失败。

文件模块运行时动态加载，就需要经历路径分析、文件定位、编译执行这三个步骤，速度比核心模块慢。

node加载模块的顺序：
1. 缓存
2. 核心模块
3. 文件模块

## 文件模块加载
node引入文件模块需要执行下面三个步骤：
1. 路径分析
2. 文件定位
3. 编译执行

## 1. 路径分析
require() 方法接收一个标识符作为参数，标识符分成如下：
- 核心模块：如http、fs、path等
- 路径形式的模块文件，以/、.、..路径引入的文件模块
- 非路径形式的模块文件，如加载axios模块包`require('axios')`

### 路径形式的文件模块
require()方法会将路径转为真实的路径，并以真实的路径作为索引，然后编译执行。由于明确了文件模块的位置，缩短了路径分析步骤。

### 非路径形式的模块文件
这类模块既不是核心模块，也不是路径形式模块（`require('axios')`）。node在进行路径查找时，需要逐级查找该文件模块的路径。这类模块加载最耗时，是所有模块加载最慢的一种。
```js
[
  '/Users/duan/Work/project/blog/js/node_modules',
  '/Users/duan/Work/project/blog/node_modules',
  '/Users/duan/Work/project/node_modules',
  '/Users/duan/Work/node_modules',
  '/Users/duan/node_modules',
  '/Users/node_modules',
  '/node_modules'
]
```
文件路径越深，模块查找耗时就越多，这是自定义模块的加载速度最慢的原因。

## 文件定位
模块路径分析完成以后，需要根据引用获取具体引用的文件真实路径，主要包括了扩展名分析、目录分析，

### 文件拓展名分析
在require的时没有包含文件扩展名，node会按.js、.json、.node的顺序补足扩展名，node在判断当前检测当前文件是否存在时，会阻塞后续后续任务进行。如果文件的拓展名为 .json、.node时，最好将文件后缀带上。

### 目录分析
require() 通过分析文件扩展名之后，可能只是找到了一个目录。此时，node就会读取当前目录下的package.json文件，从中获取 main 属性指定的文件名进行定位，如果 main 指定的文件名错误或者没有 package.json 文件，node 会将 index 当成默认的文件名。

如果上面目录分析过程没有找到文件，就会进入下一个模块路径。

## 模块编译
node模块加载编译过程会根据不同的扩展名，选择不同的方式进行文件模块加载编译：
- .js：使用fs模块同步读取内容后编译
- .json：使用fs读取内容后，使用JSON.parse解析内容
- .node：这是用 C/C++ 写的扩展文件最终编译生成的，通过process.dlopen()方法加载
- 其他扩展名：当作js文件载入

.json文件内容使用JSON.parse解析得到的对象会直接赋值给module.exports；.node文件是C/C++编译生成的，可以直接使用process.dlopen进行加载。

### .js模块编译
写文件模块代码时我们没有提供 module、exports、require、__ filename、__ dirname 这些变量，但是在实际写代码时我们又可以直接访问到，这5个变量实际是在模块编译过程对js封装时传入的，node在编译js时，会将js文件封装成下面这样：
```js
(function(exports, require, module, __filename, __dirname) {
  // ...
})(exports, require, module, __filename, __dirname)
```
其中exports是module.exports对象的地址，因此我们需要将exports.xx写在module.exports = xx语句后面。

## 模块缓存
每一个文件模块都是一个由 Module 实例出来的对象。每一个编译成功的模块都会以文件路径作为索引缓存到 `require.cache` 中。

