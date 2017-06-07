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
      if (!immediate) {
        func.apply(this, arguments);
      }
    }
    var callnow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(delay ,wait);
    console.log(callnow);
    if (callnow) {
      func.apply(this, arguments);
    }
  }
}
