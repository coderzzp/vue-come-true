export function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value: value,
        writeable: true,
        configurable: true,
        enumerable: !!enumerable
    });
}

export function debounce(func, wait, immediate) {
  var timeout = null;
  
  return function () {
    var delay = function () {
      timeout = null;
      // 需要判断下，否则对于immediate为true的情况会触发两次
      if (!immediate) {
        func.apply(this, arguments);
      }
    }
    var callnow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(delay ,wait);
    // 第一次触发事件立即执行
    console.log(callnow);
    if (callnow) {
      func.apply(this, arguments);
    }
  }
}

/*
export function computeExpression(vm, exp) {
    try {
        with (vm) {
            return eval(exp);
        }
    } catch (e) {
        console.error('ERROR', e);
    }
}*/