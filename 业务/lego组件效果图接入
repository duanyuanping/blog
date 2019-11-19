# 组件效果图获取

## 前言

**后端服务迁移中，oci构建**

lego平台接下来会推出以下几个功能，这些功能实现的基础就是要有组件效果图，下面大概展示下有哪些功能：

- 根据图片识别相应组件的功能，要实现这个功能，需要所有组件都提供相应的效果图
- 展示组件使用方式，开发者一键复制使用例子代码
- 图片搜索，开发者提供一张图片，lego平台搜索后台相似的图片（可以通过图片跳转到对应的组件）

## 接入步骤

组件效果图获取有4步流程，分别是：

1. 配置文件screenshot
2. 本地调试
3. 上传组件效果图
4. 组件效果图查看

以下展示的步骤均可以参考nowpc/nowpc-activity-ui-infocard组件

### 1、配置文件screenshot

在原有的组件内容中新建screenshot文件夹，screenshot目录下需要创建一个index.js文件

![image-20191022125239067](https://pic.url.cn/hy_personal_room/0/now_acticity1571720029300.png/0)

screenshot/index.js文件中的内容会以props传入组件，在组件能够运行的情况下，可以只配置影响组件展示效果的参数，文件内容结构如下：

```
export default {
		loading: { // prop属性名
        required: false, // 是否必需，{true | false}，可以不写，默认为false（非必需参数）
        values: [true, false] // 该prop的值，如果只有一个值也需要使用数组的形式进行传入
    },
    className: {
        required: true,
        values: ['anchInfo']
    },
    ...
}
```

下面展示例子：nowpc-activity-ui-infocard/screenshot/index.js的完整代码：

```
import React from 'react';
import './index.less';

export default {
	loading: { // prop名
        required: false, // 是否必需，{true | false}，可以不写，默认为false（非必需参数）
        values: [true, false] // 该prop的值，如果只有一个值也需要使用数组的形式进行传入
    },
    className: {
        required: true,
        values: ['anchInfo']
    },
    style: {
        required: true,
        values: [
            {
                float: 'left',
                width: 337
            }
        ]
    },
    cover: {
        required: true,
        values: [{
            text: 'http://shp.qpic.cn/room_r_pic/31294528/312945281568271464/360x',
            style: { height: 190 }
        }]
    },
    children: {
        required: false,
        values: [
            (
                <div className="base-info">
                    <div className="header">
                        <div className="title">5排冲王者</div>
                        <div className="city">广州市</div>
                    </div>
                    <div className="footer">
                        <div className="footer-left">
                            <div className="anchor">米丫头</div>
                            <div className="onlive-icon onlive-icon-font">直播中</div>
                        </div>
                        <div className="fans-num">100000000</div>
                    </div>
                </div>
            )
        ]
    }
}
```

### 2、本地调试

调试前的准备工作：

- 运行`cat ~/.feflow/package.json | grep "@tencent/feflow-plugin-lego"`查看@tencent/feflow-plugin-lego包版本，确保本地feflow安装的@tencent/feflow-plugin-lego包版本至少为0.4.15版本，如果没有达到这个版本，请运行`feflow lego`进行包升级，如果没有安装这个插件请运行 `feflow install @tencent/feflow-plugin-lego`进行安装
- 将master上面最新的代码合并到当前开发分支
- 项目安装依赖`tnpm i`

开始调试：

- Lego-component-warehouse项目下运行命令`feflow lego s 组件名`，例如：`feflow lego s nowpc-activity-ui-infocard`，这条命令功能和跑demo的命令功能类似，都会在本地起一个服务，然后浏览器输入相应地址，查看配置文件跑出来的效果

效果如下：

![image-20191016210441751](https://pic.url.cn/hy_personal_room/0/now_acticity1571367522083.png/0)

页面是根据组件的配置文件跑出来的所有效果，重复的效果会在组件效果图上传的时候去重。

### 3、上传组件效果图

确认配置展示的效果图无误后，将当前分支合并到master分支，就会触发截取组件效果的钩子。oci构建完成以后，后台服务会获取当前分支更新的组件进行截图操作。

### 4、组件效果图查看

lego平台进入开发的组件页面，该页面会有一个效果图tab，点击进入就能看到组件配置文件跑出来的组件的一些效果图了，同时支持手动上传效果图（暂时只支持平台管理员和组件开发者）。

![image-20191016210254742](https://pic.url.cn/hy_personal_room/0/now_acticity1571367546347.png/0)

## 注意项

- 组件index.js文件

  组件文件index.js暂时只支持 `export default 组件名`方式导出组件的，实例如下：

  ![image-20191017094014146](https://pic.url.cn/hy_personal_room/0/now_acticity1571366552465.png/0)

  目前不支持使用的`export { ComponentName };`方式导出的。

- 不提供screenshot/index.js

  如果开发者没有提供screenshot/index.js内容，配置构建的时候默认读取组件的defaultProps。

- 文件删除相关

  所有**自动截取**的效果图都是有可能被删除，这完全取决于配置文件跑出来的效果。手动上传的图片不会自动删除，可以手动删除这类图片。

- 什么样的组件效果可以自动截取

  程序自动获取配置文件构建的所有效果（程序会在页面加载5s后进行效果图截取，所以组件内部有请求的也是可以正常使用）。对于需要用户操作的组件效果图程序无法自动获取，需要开发者到组件效果图页面进行手动上传。

- 栗子

  大家开发的时候可以在组件开发库中的`components/nowpc/nowpc-activity-ui-infocard`组件中看到配置文件的栗子。
