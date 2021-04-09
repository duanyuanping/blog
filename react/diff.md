react中利用以下两点，来将diff过程提速：
- 两个不同类型节点，将生成不同的树
- 开发者使用key，告知哪些子元素在不同渲染下可以保持不变

## diff
### diff-不同类型元素
react在元素节点更新的时候，首先会比较根节点类型是否发生改变（<a>变成<span>、<p>变成<div>等等），如果根节点类型发生改变，react会将卸载原有的树，同时会构建新的树。

树卸载的过程，就会触发组件实例中的`componentWillUnmount`。当创建树的时候会触发`UNSAFE_componentWillMount`方法，紧接着会触发`componentDidMount`方法，同时与之前的树相关的state、实例都会被销毁。

### diff-相同类型元素
如果节点在diff过程类型没有发生改变，react会保留当前dom节点，然后对比两个节点中的属性，将节点属性更新就可以了。
```html
<div className="before" title="stuff" />

<div className="after" title="stuff" />
```
react对比两个元素节点的，元素类型都没有变化，都是div。然后再比较属性，发现classsName发生改变了，对于这个节点react只会更新节点的属性。

```html
<div style={{color: 'red', fontWeight: 'bold'}} />

<div style={{color: 'green', fontWeight: 'bold'}} />
```
react元素中的style对象中部分属性发生改变，react只会更新发生改变的值。因此上面代码中，react只会修改节点style中的color属性，fontWeight不会更新。

react处理完当前节点以后，就会递归更新子节点。

### diff-同类型组件
当组件更新是，组件实例会保持不变，因此可以在不同渲染时保持state一致。当props发生改变的时候，react会去更新当前组件的props，同时会调用`UNSAFE_componentWillReceiveProps`、`UNSAFE_componentWillUpdate`、`componentDidUpdate`

### 对子节点递归
默认情况下，当递归 DOM 节点的子元素时，React 会同时遍历两个子元素的列表；当产生差异时，生成一个 mutation。

在子节点列表末尾添加元素，这样开销就比较小：
```html
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```
react先会匹配`<li>first</li>`发现没有什么改变，然后匹配第二个元素`<li>second</li>`，最后在ul元素中插入第三个元素。

如果新增的元素在其他子元素前面：
```html
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```
react先匹配第一个li，发现节点类型没有发生改变，只是元素内容发生改变了，然后将内容更新。接着匹配第二个li，同样类型没有变化，只是内容变了，然后修改内容。原树形结构中没有第三个元素，react就需要新建一个li元素出来。

这里原本只是在子节点列表头部加了个新节点，其他节点都没有发生改变，却触发了两次更新，一次新建过程，严重影响性能。

### key
为了解决上面的问题，react中引入了key。当节点有key以后，react就会优先使用key来进行节点匹配，如果key没有匹配上，才会去新增节点。
```html
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```
这样，react会移动2015和2016元素节点，新建2014节点。

#### key diff过程（？？？）
