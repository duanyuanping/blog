用户登录，更新 LocalStorage 中的用户权限

调用 utils 目录中的 Authorized.js 文件中的 reloadAuthorized 函数

调用 @/components/Authorized 中的 index 文件中的 renderAuthorize(Authorized)执行返回的函数（接收 currentAuthority（当前用户权限）参数，将 CURRENT 变量变成用户权限值并导出）（在调用 index.js 文件的时候，同时会将 check 属性函数添加到 Authorized 函数上）

页面权限渲染：

每次渲染新的页面的时候都需要去调用 utils 中的 Authorized 函数，Authorized 函数会调用 checkPermissions 函数去判断用户是否有权限访问该页面，有就渲染该页面，没有就不渲染页面内容，显示 403 内容

menu 列表渲染：

调用 @/components/Authorized 中的 check 函数（该函数使用了 checkPermissions 函数，并使用了前面存放的 CURRENT 当前权限变量，来对权限进行判断），判断用户的权限和 menuitem 之间的权限关系并返回需要渲染的 menuitem 组件



react-router 实现权限管理（管理是否登录）：

```
...
class AuthorizedRoute extends Component {
  ...
  render() {
  	const { Com } = this.props
    return (
    	<Route render={ props => {
        return isLogin
        	? <Com {...props} />
        	: <Redirect to="/login" />
    	}
    	}/>
    )
  }
}
```





