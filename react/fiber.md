## 为什么要引入fiber
react中，渲染一个页面，是通过调用render函数来完成的，在render中，会递归遍历页面虚拟dom中的所有节点，这就形成大量函数调用的执行栈，这些都是同步执行，只有当这些函数执行栈都出栈以后，浏览器才能运行GUI渲染线程。diff过程，如果页面比较简单，那页面基本上不会有任何问题，但是一旦页面过于复制，递归层级太深，js主线程一直执行，导致GUI线程一直没办法运行，出现页面卡顿的问题。

## react任务分片
react按照虚拟dom将任务分解成多个小片，每个组件实例和dom节点都被认为是一个fiber，在diff过程中，每次处理一个fiber，处理完一个就会判断是否有高优先级的任务或者剩余时间是否充足，可以继续处理、挂起、完成工作循环。

## react阶段划分
react将diff和渲染工作分成了两个阶段（之前diff和渲染是一块执行的，即节点diff发现变更，就立马更新页面元素节点），分别是Reconciliation(协调阶段)和Commit(提交阶段)。

### Reconciliation(协调阶段)
这个阶段可以认为是react diff过程，react会找到节点的变更，例如节点增删改，这些变更被称做Effect(副作用)，**注意：协调阶段任务是可以被打断的**。

协调阶段的执行的生命周期函数：
- construct
- UNSAFE_componentWillMount
- UNSAFE_componentWillReceiveProps
- getDerivedStateFromProps
- shouldComponentUpdate
- UNSAFE_componentWillUpdate
- render

协调阶段工作流程：  
1. 找到从根节点到叶子节点中优先级最高的workInProgress tree，获取待处理的节点（组件或者元素节点，这里都是虚拟dom）
2. 检测当前节点是否更新，不更新的话就给当前分片优先级定为4；如果更新了，就标注当前更新类型（EffectTag，有节点类型更新、属性更新等），就将当前变更(Effect)记录下来，等到提交阶段来进行渲染
3. 当前虚拟节点不存在child，证明当前节点已经是该分支的最后节点，就可以向上收集Effect
4. 把child或者sibling当做nextUnitWork，进入下一个协调阶段工作循环。如果回到了workInProgress tree的根节点，则工作循环结束
5. 进入提交阶段

>注意：每个节点都有workInProgress tree

react组件每次需要更新时，该组件对应的fiber节点就会添加一个update.expirationTimes类似于时间戳的字段，用来表示优先级，该值离当前事件越近，该fiber节点更新的优先级就越高。当前时间如果超过了update.expirationTimes定义的时间，表示update过期了，此时该fiber的update优先级最高，会同步执行该fiber节点的协调和提交阶段，本轮任务中就必须要将该fiber节点更新完。

>一个fiber树有多个fiber节点

### Commit(提交阶段)
将协调阶段产生的Effect(副作用)全部执行完，这部分执行页面渲染任务，由于当前执行的任务会让用户页面发生改变，因此`commit阶段任务必须是同步执行`的，不能被打断。

提交阶段执行的生命周期函数：
- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount

提交阶段工作流程：
1. 如果有getSnapshotBeforeUpdate，就调用getSnapshotBeforeUpdate
2. 根据节点更新类型(EffectTag)，更新节点
3. 调用生命周期，初次就调用componentDidMount，更新就调用componentDidUpdate