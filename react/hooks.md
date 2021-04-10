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
