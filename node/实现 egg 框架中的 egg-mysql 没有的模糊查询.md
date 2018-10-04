# 实现 egg 框架中的 egg-mysql 没有的模糊查询

## 简述

以下使用的是 eggjs 框架。

egg 框架提供的 egg-mysql 的插件中并没有模糊查询这个功能，这里我们简单实现模糊查询封装。实现模糊查询的方式有多种，例如：like、instr ，前面列举的两种在是否有索引的情况下性能都会有差异，所以我感觉这就是 egg-sql 不封装模糊查询功能的原因。在一些不用考虑到模糊查询性能的项目中，我们如果每次使用模糊查询的时候都亲自去写 sql 语句，那得使用很大的精力和时间。

下面提供的函数是在 egg-mysql 插件的基础上封装的，并且此封装用于不用考虑模糊查询性能的项目，用的是 like 这个 api。

## 初始化

我们首先需要在 app.js 文件中将 mysql 连接初始化，如下：

```
module.exports = app => {
  app.beforeStart(async () => {
    console.log('在启动项目之前需要做的一些初始化，比如对mysql的连接');
    // 这里将 mysql 的配置放在了 配置文件（config.default.js）中，所以直接读取就行，至于 egg-mysql 怎么配置怎么用请自行查询
    const mysqlConfig = app.config.mysql;
    // 在 controller、service 层可以通过 this.app.database 来获取 mysql 连接好的对象
    app.database = app.mysql.createInstance(mysqlConfig);
  });
};
```

## BaseService.js

这个文件中我们首先定义两个函数_select（模糊查询获取到的数据列表） 和 _count（满足 where 条件的数据总量），这两个函数都接受 table（表名） 和 condition（条件， where、limit、offset、columns） 这两个参数，我们需要模糊查询的参数放在 where 对象中并以 SQL_like 为属性名，代码如下：

```
// 模糊搜索的数据列表
const _select = async function(table, condition) {
  const { app: { database }, logger } = this;
  // 获取传入的 columns、where、SQL_like、orders、limit、offset
  let { columns, where: { SQL_like, ...where }, orders, limit, offset } = condition || {};
  // 对 limit 和 offset 变量做处理，如果传值不规范或者没有传入，那就赋默认值
  limit = isNaN(parseInt(limit)) ? 10 : parseInt(limit);
  offset = isNaN(parseInt(offset)) ? 0 : parseInt(offset);

  try {
  	// 返回的数据列
    const query_str = columns ? `${columns}` : '*';
    // whereStr 函数会在后面展示，它返回的值是 sql 中 where 部分的语句
    const where_str = whereStr(where, SQL_like);
    // 排序
    const order_str = orders instanceof Array && orders.length !== 0 ? `order by ${orders.map(val => `${val[0]} ${val[1]}`)}` : '';
    // 返回的数据限制
    const limit_str = `limit ${limit} offset ${offset}`;
    // 返回查询结果，这里 sql 语句查询使用的是 egg-mysql 插件中的 query 函数
    return await database.query(`select ${query_str} from ${table} ${where_str} ${order_str} ${limit_str}`);
  } catch (error) {
    logger.error('====== BaseService', error);
  }
  // 如果查询出错就返回空数组
  return [];
};

// 模糊搜索数据总量
const _count = async function(table, condition) {
  const { app: { database }, logger } = this;
  // 获取 where 和 SQL_like 字段
  const { where: { SQL_like, ...where } } = condition || {};

  try {
  	// 生成 where 语句，whereStr 函数将在后面展示
    const where_str = whereStr(where, SQL_like);
    // 查询结果
    const total = await database.query(`select count(*) as total from ${table} ${where_str}`);
    // 返回查询的总数
    return total[0].total;
  } catch (error) {
    logger.error('====== BaseService', error);
  }
  // 此查询出错就返回 0 
  return 0;
};
```

下面展示 whereStr 函数代码：

```
// 拼接 where 语句，如果忘了 sql 中 where 是怎么拼接的可以去网上搜下怎么拼接
const whereStr = (where, like) => {
	// 将 like 对象中的属性拼接成字符串，这里的模糊查询使用的like，
  const like_str = typeof like === 'object' && Object.keys(like).length > 0
    ? `${Object.entries(like).map(val => `${val[0]} like '%${val[1]}%'`).join(' and ')}`
    : '';
   // 如果 where 不是空对象，并且 where 的属性不是数组那就用 = 将属性和值拼接起来，如果是数组那就使用 in，属性用and连接，然后再和 like_str 连接起来。
  // 如果 where 是空对象，那就只需要将 like_str 字符串放入 where 语句中
  const where_str = where && Object.entries(where).length !== 0
    ? `where ${Object.entries(where).map(val => `${val[0]} ${val[1] instanceof Array ? 'in' : '='} '${val[1]}'`).join(' and ')} ${like_str !== '' ? 'and' : ''} ${like_str}`
    : `${like_str !== '' ? 'where' : ''} ${like_str}`;
  // 返回拼接完成后的 where 语句
  return where_str;
};
```

```
const Service = require('egg').Service;

class BaseService extends Service {
  constructor() {
    super(...arguments);
    // 将模糊查询的两个函数写入 this.app.database 对象中，后面将展示如何使用
    this.app.database.selectFu = _select.bind(this);
    this.app.database.countFu = _count.bind(this);
  }
}

module.exports = BaseService;
```

使用封装好的模糊查询：

```
// 这是 service 层的一个文件
const Service = require('../BaseService');

class UserService extends Service {
	...
	const [list, total] = await Promise.all([
    app.database.selectFu('t_user', {
      where: { SQL_like: 'st' },
      limit: 10,
      offset: 0
    }),
    app.database.countFu('t_user', { where: { SQL_like: 'st' }, }),
	])
	...
}

module.exports = UserService;

```

**注意**：模糊查询的条件属性名是 SQL_like 是 where 对象的一个属性。 

如果想看完整的 BaseService.js 文件请移步同目录中 code 目录下的 [BaseService.js](https://github.com/duanyuanping/True-in-Hong/blob/master/node/code/BaseService.js)。