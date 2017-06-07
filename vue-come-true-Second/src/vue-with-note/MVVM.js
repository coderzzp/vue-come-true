import Watcher from './watcher'
import observer from './observer'
import Compiler from './compiler'

class MVVM {
    constructor (options) {
        this.$options = options;
        this._data = this.$options.data;
        var self = this;
        // 数据劫持(代理) vm.data.属性名称 => vm.属性名称 方便访问
        Object.keys(this.$options.data).forEach(key => {
            this._proxy(key);
        });
        //监听数据，给数据添加dep主题对象，在数据改变时通知订阅了该属性的watcher
        observer(this._data);
        //编译结点，解析各种指令，并且将每个node节点对应一个watcher身份，在收到通知时改变自身view视图
        this.$compiler = new Compiler(options.el || document.body, this);
    }

    $watch (expression, callback) {
        new Watcher(this, expression, callback);
    }

    _proxy (key) {
        let self = this;
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get() {
                return self._data[key];
            },
            set(value) {
                self._data[key] = value;
            }
        });
    }
}

window.MVVM = MVVM;