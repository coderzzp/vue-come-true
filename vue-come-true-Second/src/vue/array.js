import { def } from './util';

const arrayProto = Array.prototype;
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
    const original = arrayProto[method];
    def(arrayMethods, method, function() {
        let i = arguments.length;
        const args = new Array(i);
        while(i--) {
            args[i] = arguments[i];
        }
        const result = original.apply(this, args);
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
        if (inserted) ob.observerArray(inserted);

        ob.dep.notify();
        return result;
    });
});