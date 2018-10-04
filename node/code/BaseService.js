/**
 * @desc 此次封装的模糊查询并没有考虑到性能方面的问题
 */

'use strict';

const Service = require('egg').Service;

const whereStr = (where, like) => {
  const like_str = typeof like === 'object' && Object.keys(like).length > 0
    ? `${Object.entries(like).map(val => `${val[0]} like '%${val[1]}%'`).join(' and ')}`
    : '';
  const where_str = where && Object.entries(where).length !== 0
    ? `where ${Object.entries(where).map(val => `${val[0]} ${val[1] instanceof Array ? 'in' : '='} '${val[1]}'`).join(' and ')} ${like_str !== '' ? 'and' : ''} ${like_str}`
    : `${like_str !== '' ? 'where' : ''} ${like_str}`;
  return where_str;
};

// 模糊搜索的数据列表
const _select = async function(table, condition) {
  const { app: { database }, logger } = this;
  let { columns, where: { SQL_like, ...where }, orders, limit, offset } = condition || {};
  limit = isNaN(parseInt(limit)) ? 10 : parseInt(limit);
  offset = isNaN(parseInt(offset)) ? 0 : parseInt(offset);

  try {
    const query_str = columns ? `${columns}` : '*';
    const where_str = whereStr(where, SQL_like);
    const order_str = orders instanceof Array && orders.length !== 0 ? `order by ${orders.map(val => `${val[0]} ${val[1]}`)}` : '';
    const limit_str = `limit ${limit} offset ${offset}`;
    return await database.query(`select ${query_str} from ${table} ${where_str} ${order_str} ${limit_str}`);
  } catch (error) {
    logger.error('====== BaseService', error);
  }
  return [];
};

// 模糊搜索数据总量
const _count = async function(table, condition) {
  const { app: { database }, logger } = this;
  const { where: { SQL_like, ...where } } = condition || {};

  try {
    const where_str = whereStr(where, SQL_like);
    const total = await database.query(`select count(*) as total from ${table} ${where_str}`);
    return total[0].total;
  } catch (error) {
    logger.error('====== BaseService', error);
  }
  return 0;
};

class BaseService extends Service {
  constructor() {
    super(...arguments);
    this.app.database.selectFu = _select.bind(this);
    this.app.database.countFu = _count.bind(this);
  }
}

module.exports = BaseService;
