import Dep from './dep';
import { def } from './util';
//arrayMethods是劫持了数组方法的对象
import { arrayMethods } from './array';

//原型继承
function protoAugment(target, src) {
    target.__proto__ = src;
}
//赋值继承
function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        //fixbug
        def(target, keys[i], src[keys[i]]);
    }
}
//注意：obeserver只监听对象。
export default function observer(data) {
    if (!data || typeof data !== 'object') {
        return;
    } else if (data.hasOwnProperty("__ob__") && data["__ob__"] instanceof Observer) {
        return;
    }
    return new Observer(data);
}

class Observer {
    constructor(data) {
        //这里的dep作用，一开始也比较困惑，后来觉得应该是给数组用的主题，
        this.dep = new Dep();
        // 给每个数据一个指向Observer的引用，array.js会用到
        def(data, "__ob__", this);
        this.data = data;
        //vm.data中如果存在数组，会在后面的递归中进入下面if这个流程
        if (Array.isArray(data)) {
            //【？？？】如果data有原型？这里data已经是数组了当然有原型。。不太明白这里什么意思
            const argment = data.__proto__ ? protoAugment : copyAugment;
            // 开始覆盖data数组的原生方法
            argment(data, arrayMethods, Object.keys(arrayMethods));
            // 对数组元素遍历下，有元素可能是对象
            this.observerArray(data);
        } else {
            //开始遍历所有data对象的所有属性
            this.walk(data);
        }

    }

    walk(data) {
        let self = this;
        Object.keys(this.data).forEach(function (key) {
            self.defineReactice(data, key, data[key]);
        });
    }

    observerArray(items) {
        for (let i = 0; i < items.length; i++) {
            // 数组的元素是对象就监听
            observer(items[i]);
        }
    }

    defineReactice(data, key, value) {
        // dep即我们之前提到的主题对象，它既可以添加观察者Watcher，又可以发布事件让所有Watcher更新视图，每个属性都有一个dep
        let dep = new Dep(),
            descriptor = Object.getOwnPropertyDescriptor(data, key);
        //如果已经存在访问器且访问器接口的configurable属性为false则直接返回
        if (descriptor && !descriptor.configurable) {
            return;
        }
        //递归监听，value是对象会返回一个new Observer(value)，否则childObserver为undifined
        let childObserver = observer(value);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                //get函数会在node编译时初始化赋值时触发，此时Dep.target会指向那个watcher观察者
                if (Dep.target) {
                    // 为这个属性添加观察者watcher
                    dep.depend();
                    //如果存在子数组（这里认为对子对象来说没有作用），则为子数组添加观察者，当数组使用方法时，数组的dep发布事件并更新视图
                    if (childObserver) {
                        childObserver.dep.depend();
                    }
                }
                return value;
            },
            set: function (newValue) {
                if (newValue == value) {
                    return;
                }
                if (typeof newValue === 'object') {
                    //观察新值
                    observer(newValue);
                }
                value = newValue;
                // 告诉所有订阅了这个属性的Watcher，数据更新了！
                dep.notify();
            }
        });
    }
}

