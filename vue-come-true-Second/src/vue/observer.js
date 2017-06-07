import Dep from './dep';
import { def } from './util';
import { arrayMethods } from './array';


function protoAugment(target, src) {
    target.__proto__ = src;
}

function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        def(target, key[i], src[key[i]]);
    }
}

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
        this.dep = new Dep();
        def(data, "__ob__", this);
        this.data = data;

        if (Array.isArray(data)) {
            const argment = data.__proto__ ? protoAugment : copyAugment;
            argment(data, arrayMethods, Object.keys(arrayMethods));
            this.observerArray(data);
        } else {
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
            observer(items[i]);
        }
    }

    defineReactice(data, key, value) {
        let dep = new Dep(),
            descriptor = Object.getOwnPropertyDescriptor(data, key);
        if (descriptor && !descriptor.configurable) {
            return;
        }

        let childObserver = observer(value);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Dep.target) {
                    dep.depend();
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
                    observer(newValue);
                }
                value = newValue;
                dep.notify();
            }
        });
    }
}

