mobx使用：
```js
// apple.js
import { action, observable } from 'mobx';

class Apple {
    @observable
    name: string = '';

    @action
    async setName(value: string) {
        const result = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(value);
            }, 4000);
        });
        this.name = result as string;
    }
}
export default new Apple();

// five.js
import * as React from 'react';
import { observer } from 'mobx-react';
import apple from './apple';

@observer
export default class Five extends React.Component {
    apple = apple;

    setName = () => {
        this.apple.setName('hello world');
    }

    render() {
        return (
            <div>
            {this.apple.name}
            <button onClick={this.setName}>change</button>
        </div>);
    }
}
```

## 区别
1. 数据存储：mobx数据分开存在多个store中；redux数据存放在一个store中。
2. 异步请求：mobx中直接使用async/await处理异步任务；redux中需要依靠middleware，在自定义中间中使用promise链动态调用then处理。
3. 数据修改：直接执行mobx中的action函数，action中直接修改store中的值；redux需要dispatch一个action，然后在reducer中判断到该action对应的值。redux修改链路相对于mobx更长。
4. 调试能力：mobx中的监控store数据更新等能力都抽象封装好了，对于开发者来说，更难调试问题；redux中数据修改需要遵循规定的链路，数据流向更清晰，更好调试。