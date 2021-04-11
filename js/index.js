function compose(middleware) {
  return function(context, next) {
    if (!middleware.length) return;

    let index = 0;
    return dispatch(index);

    function dispatch(i) {
      if (i < index) throw Error('...');

      index = i;
      let fn = middleware[i];

      if (i === middleware.length) fn = next;

      try {
        return Promise.resolve(fn(context, dispatch.bind(num, i + 1)))
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
}