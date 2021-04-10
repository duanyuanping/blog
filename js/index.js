let _state;
let _deps;

export function useState(initialValue) {
  _state = _state || initialValue;

  function setState(newValue) {
    stateValue = newValue;
    render();
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