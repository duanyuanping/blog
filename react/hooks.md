## 为什么要提出hooks
- 组件之间不好复用状态逻辑：组件逻辑状态难复用，一般需要使用props或者高阶组件（例如redux，使用高阶组件，来读取store中的数据和dispatch），他们本质上，还是将复用逻辑提到父组件中。
- 复杂的class组件，需要考虑js中的this工作方式，有的时候需要熟悉this绑定机制才能让程序正常运行下去。

## 常用的hooks
- useState：state存储与修改
- useEffect：可以将useEffect看作是componentDidMount、componentDidUpdate、componentWillUnmount三个函数的集合
  - useEffect(fn, conditions)：useEffect第一个参数传入一个回调函数，当前满足conditions中的值发生改变时，fn回调函数就回执行。fn返回的函数，会在组件将要卸载的时候执行。conditions不传就相当于componentDidMount+compoentnDidUpdate
- useContext：子组件中跨层级获取context值
- useReducer：`const [state, dispatch] = useReducer(reducer, initArgs, init)`
  - reducer是reducer函数；initArgs是当前reducer的初始值（state）；当initArgs是根据props动态获取的时候，我们就可以使用init来定义一个函数，动态获取initArgs值来设置reducer的初始值（state）
- useCallBack：更新函数依赖的参数值（返回一个 memoized 回调函数）。会返回传入的函数，该函数中使用的参数也会更新
```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
// 当a、b两个依赖更新的时候，memoizedCallback执行时，doSomething函数调用传入的参数也是最新的a，b
```
- useMemo：返回传入函数执行返回的值（返回一个 memoized 值）。


## 实现
一下内容来源于文章[react hooks原理](https://github.com/brickspert/blog/issues/26)。
```js
let _state;
let _deps;

export function useState(initialValue) {
  _state = _state || initialValue;

  function setState(newValue) {
    stateValue = newValue;
    render(); // 重新执行函数组件
  }
    
  return [initialValue, setState];
}

export function useEffect(callback, depArray) {
  // useEffect是否有传入第二个值
  const hasNoDeps = !depArray;
  // _deps值是否有发生变化
  const hasChangedDeps = _deps ? !depArray.every((v, i) => _deps[i] === v) : true;

  // useEffect执行没有传入第二个值或者传入的列表值发生变化时，执行callback回调，并更新_deps缓存
  if (hasNoDeps || hasChangedDeps) {
    callback();
    _deps = hasChangedDeps;
  }
}
```
上面代码实现，只能在一个函数组件中分别使用一次useState和useEffect。

为了在同一个函数组件中多次调用相同的hooks API，这里我们使用数组来存放对应的值。

```js
let memoizedState = []; // hooks 存放在这个数组
let cursor = 0; // 当前 memoizedState 下标

function useState(initialValue) {
  memoizedState[cursor] = memoizedState[cursor] || initialValue;

  function setState(value) {
    memoizedState[cursor] = value;
    render(); // render中将cursor重置为0，然后重新执行函数组件
  }

  return [memoizedState[cursor++], setState];
}

export function useEffect(callback, depArray) {
  const hasNoDeps = !depArray;
  const deps = memoizedState[cursor];
  const hasChangedDeps = deps ? !depArray.every((v, i) => deps[i] === v) : true;

  if (hasNoDeps || hasChangedDeps) {
    callback();
    memoizedState[cursor] = depArray;
  }
  cursor++;
}
```

1. 初始化  
![](https://user-images.githubusercontent.com/12526493/56090138-6871ae80-5ed0-11e9-8ffe-2056411a19d3.png)
2. 初次渲染  
![](https://user-images.githubusercontent.com/12526493/56090141-71628000-5ed0-11e9-9ac9-3a766be35941.png)
3. 事件触发  
![](https://user-images.githubusercontent.com/12526493/56090143-745d7080-5ed0-11e9-8d05-c66053a15b63.png)
4. Re Render  
![](https://user-images.githubusercontent.com/12526493/56090147-78898e00-5ed0-11e9-8b8c-8768c7651044.png)
## hooks使用问题
- 为什么只能在函数最外层调用 Hook？为什么不要在循环、条件判断或者子函数中调用？
hooks API中将按照hoos调用顺序，将值存放在数组中，hooks调用顺序发生改变，memoizedState并不能感知到。