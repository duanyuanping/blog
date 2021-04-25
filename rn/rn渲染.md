![](https://poetries1.gitee.io/img-repo/2019/10/680.jpeg)
(图片来源http://blog.poetries.top/2019/10/02/rn-yuanli/)

- 绿色部分：业务代码
- 蓝色部分：实现js跨平台开发的工具和引擎
- 黄色部分：js与原生通信桥梁。其中包含3部分代码内容，js、java（android）、os（ios），js部分在这里是共用的，java和os可以一起使用。如果需要定制原生控件，需要写bridge的内容
- 红色部分：客户端功能，客户端与js通信需要借助bridge层

## JavaScriptCore、ReactJs、Bridge
- JavaScriptCore：提供js代码解释执行能力
- ReactJs：提供虚拟dom、虚拟dom diff功能
- Bridge
  - 接收reactjs中的绘制指令，然后将指令给native进行组件绘制，同时接收native层组件的事件反馈给reactjs。
  - 给rn中内嵌的js engine提供原生的拓展给js使用，例如将通知、定位、缓存这些只能native调用的功能封装js接口写入js engine中，js程序直接调用这些api，来调用native层功能。MessageQueue.js中运行的就是bridge的代码，其中包含了js2rn、rn2js的代码内容。js和rn之间相互调用功能的时候，不存在指针传递，所有参数都是通过字符串的方式进行传递。所有的参数都会在js和native两端分别编号，然后做映射，这些编号用于定位跨界对象。


## RN初始过程
rn初始过程主要分为下面3个步骤：
- 代码资源加载
  - 静态加载：ios不存在动态加载代码的功能，需要在项目编译的时候就生成静态代码，程序启动的时候，就会将所有代码都加载好。
- js engine初始：RootView会初始一个空的js engine，该engin包含一些基础模块和方法（fetch、require等）。js engine不直接管理UI绘制，原生组件对UI绘制进行控制，其中一部分事件会由原生控件自己消耗掉；另一部分通过bridge派发给messageQueue，然后在js层进行逻辑计算，由react进行虚拟dom进行计算更新，然后再通过messageQueue将绘制命令发送给原生。
- 模块加载：加载所有导出的js原生模块和方法，生成对应的js模块信息，打包成json数据给messageQueue。所有的模块都会注册到NativeModule这个js模块上


