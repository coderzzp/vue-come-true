import { def } from './util';

const arrayProto = Array.prototype;
//劫持后的方法
export const arrayMethods = Object.create(arrayProto);

[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function(method) {
    // 缓存一份原始方法
    const original = arrayProto[method];
    // 开始覆盖原始方法
    def(arrayMethods, method, function() {
        let i = arguments.length;
        // const args = [].slice.call(arguments)
        const args = new Array(i);
        while(i--) {
            args[i] = arguments[i];
        }
        //这里的this指向的是使用数组方法的数组
        const result = original.apply(this, args);
        //ob是每个数组对象对应的obeserver对象
        const ob = this.__ob__;
        let inserted;
        switch(method) {
            case 'push':
                inserted = args;
                break;
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        //如果监听的data中的对象有push,unshift,splice等添加新值的方法，就监听新值
        if (inserted) ob.observerArray(inserted);
        //每次使用数组方法，都触发数组对象的dep发布事件
        ob.dep.notify();
        return result;
    });
});