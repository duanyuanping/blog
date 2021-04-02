const isType = (obj, type) => {
  if (typeof obj !== 'object') return false;
  const typeString = Object.prototype.toString.call(obj);
  let flag;

  switch (type) {
    case 'Array':
      flag = typeString === '[object Array]';
      break;
    case 'Date':
      flag = typeString === '[object Date]';
      break;
    case 'RegExp':
      flag = typeString === '[object RegExp]';
      break;
    case 'Set':
      flag = typeString === '[object Set]';
      break;
    case 'Map':
      flag = typeString === '[object Map]';
    default:
      flag = false;
  }
  return flag;
};

const getRegExp = re => {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};

function cloneDepth(object) {
  const parents = [];
  const children = [];

  function _clone(parent) {
    if (parent === null) return parent;
    if (typeof parent !== 'object') return parent;
    
    let child;
    // 处理各种特殊数据
    if (isType(parent, 'Array')){
      child = [];
    } else if (isType(parent, 'Date')) {
      child = new Date(parent.now());
    } else if (isType(parent, 'RegExp')) {
      child = new RegExp(parent.source, getRegExp(parent))
    } else if (isType(parent, 'Map')) {
      child = new Map(parent);
    } else if (isType(parent, 'Set')) {
      child = new Set(parent);
    } else {
      proto = Object.getPrototypeOf(parent);
      child = Object.create(proto);
    }

    // 处理循环引用
    const parentIndex = parents.indexOf(parent);
    if (~parentIndex) {
      return children[parentIndex];
    };

    parents.push(parent);
    children.push(child);

    for (let key of Object.keys(parent)) {
      child[key] = _clone(parent[key]);
    }
    return child;
  }

  return _clone(object);
}

module.exports = cloneDepth;
