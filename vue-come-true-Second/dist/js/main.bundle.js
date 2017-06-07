/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dep__ = __webpack_require__(2);

//watcher观察者对象
class Watcher {

    constructor(vm, expression, callback) {
        this.callback = callback;
        this.vm = vm;
        // watch的数据属性
        this.expression = expression;
        this.callback = callback;
        // watcher监听的属性的Id
        this.depIds = {};
        // 把值备份下，以便缓冲变化
        this.oldValue = this.get();
    }
    //更新本node的视图
    update () {
        console.log("subs开始更新")
        let newValue = this.get();
        console.log(newValue)
        console.log(this.oldValue)
        let oldValue = this.oldValue;
        if (newValue !== this.oldValue) {
            // 更新备份，准备下次对比
            this.oldValue = newValue;
            // 执行回调更新视图
            console.log("开始执行回掉函数")
            console.log(this.callback)
            this.callback.call(this.vm, newValue, oldValue);
        }
        cosole.log("subs更新结束")
    }
    //观察某个属性
    addDep (dep) {
        //
        if (!this.depIds.hasOwnProperty(dep.id)) {
            // 添加订阅者
            dep.addSub(this);
            // 该属性的依赖列表
            this.depIds[dep.id] = dep;
        }
    }
    //取得node的expresstion在vm中的值
    get () {
        __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */].target = this;
        // 求值的过程会触发vm属性值的getter
        let value = this.getVMVal();
        // 访问完了，置空
        __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */].target = null;
        return value;
    }

    getVMVal () {
        let expression = this.expression.split('.');
        let value = this.vm;
        expression.forEach(function (curVal) {
            // 这里取值的过程，会调用到每一个数据的get，根据getter里面的闭包
            // 从而访问到数据的dep,调用dep.depend
            // 属性dep.depend, 进一步调用到Watch的addDep，让watcher添加进去
            value = value[curVal];
        });
        return value;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Watcher;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = observer;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dep__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__array__ = __webpack_require__(6);


//arrayMethods是劫持了数组方法的对象


//原型继承
function protoAugment(target, src) {
    console.log("1")
    target.__proto__ = src;
}
//赋值继承
function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        //fixbug
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* def */])(target, keys[i], src[keys[i]]);
    }
}
//注意：obeserver只监听对象。
function observer(data) {
    //如果该数据为空或者该数据不为对象
    if (!data || typeof data !== 'object') {
        return;
        //如果该对象已经被监听
    } else if (data.hasOwnProperty("__ob__") && data["__ob__"] instanceof Observer) {
        return;
    }
    return new Observer(data);
}

class Observer {
    constructor(data) {
        //这里的dep作用，一开始也比较困惑，后来觉得应该是给数组用的主题，
        this.dep = new __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */]();
        // 给每个数据一个指向Observer实例的引用，array.js会用到
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* def */])(data, "__ob__", this);
        this.data = data;
        //vm.data中如果存在数组，会在后面的递归中进入下面if这个流程
        if (Array.isArray(data)) {
            //【？？？】如果data有原型？这里data已经是数组了当然有原型。。不太明白这里什么意思
            const argment = data.__proto__ ? protoAugment : copyAugment;
            // 开始覆盖data数组的原生方法
            argment(data, __WEBPACK_IMPORTED_MODULE_2__array__["a" /* arrayMethods */], Object.keys(__WEBPACK_IMPORTED_MODULE_2__array__["a" /* arrayMethods */]));
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
        //注意区分这里的dep和Observer对象里的this.dep
        let dep = new __WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */](),
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
                if (__WEBPACK_IMPORTED_MODULE_0__dep__["a" /* default */].target) {
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



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__watcher__ = __webpack_require__(0);


let uid = 0;

class Dep {

    constructor () {
        this.id = uid++;
        this.subs = [];
    }

    addSub (sub) {
        this.subs.push(sub);
    }

    removeSub (sub) {
        let index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }

    depend () {
        Dep.target.addDep(this);
    }

    notify () {
        this.subs.forEach(sub => console.log("aaa"))
        // 订阅者收到更新，然后通知订阅者watcher去更新视图
        this.subs.forEach(sub => sub.update());
        console.log("subs 更新完成")
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Dep;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = def;
/* unused harmony export debounce */
function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value: value,
        writeable: true,
        configurable: true,
        enumerable: !!enumerable
    });
}

function debounce(func, wait, immediate) {
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

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__watcher__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__observer__ = __webpack_require__(1);



const tagRE = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g,
    htmlRE = /^\{\{\{(.*)\}\}\}$/,
    paramsRE = /\((.+)\)/g,
    stringRE = /\'(.*)\'/g;


class Compiler {

    constructor(el, vm) {
        this.$vm = vm;
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);

        if (this.$el) {
            //转换原始node并将其加入一个新的片段（原始node会被删除）
            this.$fragment = this.createFragment(this.$el);
            //编译这个片段
            this.compileElement(this.$fragment);
            this.$el.appendChild(this.$fragment);
        }
    }

    createFragment(el) {
        var fragment = document.createDocumentFragment(),
            child;
        //遍历原始node子节点，并删除原始node结点（注意：这里只是遍历子结点，在compileNodeAttr函数中会递归继续遍历子结点的子节点）
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }

    compileElement(el) {
        let childNodes = el.childNodes,
            self = this;

        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/g;
            //如果node类型为元素（具体查阅node的nodetype属性）
            if (self.isElementNode(node)) {
                self.compileNodeAttr(node);
            //如果node类型为文本，且存在{{data}}文本
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node);
            }
        });
    }

    compileNodeAttr(node) {
        let nodeAttrs = node.attributes,
            self = this,
            lazyComplier,
            lazyExp;

        [].slice.call(nodeAttrs).forEach(function (attr) {
            let attrName = attr.name;
            if (self.isDirective(attrName)) {
                // expression就是属性的值，例如v-if="data"中的data
                let expression = attr.value;
                // directicve就是指令名称，例如v-if="data"中的if
                let directive = attrName.substring(2);
                //先判断for，再判断on,最后判断其他指令
                if (directive === 'for') {
                    // 
                    lazyComplier = directive;
                    lazyExp = expression;
                } else if (self.isEventDirective(directive)) {
                    // 为该node绑定事件
                    directiveUtil.addEvent(node, self.$vm, directive, expression);
                } else {
                    //为该node解析指令(不包含for)
                    directiveUtil[directive] && directiveUtil[directive](node, self.$vm, expression);
                }
                // 处理完指令后将其移出（我们F12查看元素是没有指令的）
                node.removeAttribute(attrName);
            }
        });
        //for指令在这里处理（因为for指令对应的node不需要处理子节点）
        if (lazyComplier === 'for') {
            directiveUtil[lazyComplier] && directiveUtil[lazyComplier](node, this.$vm, lazyExp);
        } else if (node.childNodes && node.childNodes.length) {
            self.compileElement(node);
        }
    }

    compileText(node) {
        //wholeText是文本node的一个属性
        const tokens = this.parseText(node.wholeText);
        let fragment = document.createDocumentFragment();
        tokens.forEach(token => {
            let el;
            //如果该文本node含有需要解析的文本
            if (token.tag) {
                // 该文本含有需要解析的html
                if (token.html) {
                    // html 解析 创建空文档
                    el = document.createDocumentFragment();
                    el.$parent = node.parentNode;
                    //
                    el.$oncetime = true;
                    directiveUtil.html(el, this.$vm, token.value);

                } else {
                    // 新的响应式文本节点
                    el = document.createTextNode(" ");
                    directiveUtil.text(el, this.$vm, token.value);
                }
            } else {
                el = document.createTextNode(token.value);
            }
            //
            el && fragment.appendChild(el);
        });
        node.parentNode.replaceChild(fragment, node);
    }

    parseText(text) {
        //如果不存在需要解析的文本，直接返回
        if (!tagRE.test(text)) {
            return;
        }
        const tokens = [];
        let lastIndex = tagRE.lastIndex = 0;
        let match, index, html, value;
        //不太懂exec用法的可以去看一下文档，下面是一个exec的测试用例，console一下你就明白了
        // const tagRE = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g,
        // var text="1122{{{3344}}}"
        // var match = tagRE.exec(text)
        // console.log(match)
        while (match = tagRE.exec(text)) {
            //取到匹配到{{}}或者{{{}}}在文本中的位置
            index = match.index;
            // 先提取{{}} 或者 {{{}}} 之前的文本
            if (index > lastIndex) {
                tokens.push({
                    value: text.slice(lastIndex, index)
                });
            }
            // 是按html解析还是按text解析
            html = htmlRE.test(match[0]);
            value = html ? match[1] : match[2];
            tokens.push({
                value: value,
                tag: true,
                html: html
            });
            lastIndex = index + match[0].length;
        }
        //提取剩余文本
        if (lastIndex < text.length) {
            tokens.push({
                value: text.slice(lastIndex)
            });
        }
        return tokens;
    }

    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    }

    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }

    isElementNode(node) {
        return node.nodeType === 1;
    }

    isTextNode(node) {
        return node.nodeType === 3;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Compiler;


//一个解析不同指令的对象
const directiveUtil = {
    text: function (node, vm, expression) {
        this.bind(node, vm, expression, 'text');
    },

    html: function (node, vm, expression) {
        this.bind(node, vm, expression, 'html');
    },

    class: function (node, vm, expression) {
        this.bind(node, vm, expression, 'class');
    },

    for: function (node, vm, expression) {
        let itemName = expression.split('in')[0].replace(/\s/g, ''),
            //这里split('.')的意思：例如item in data.data1.data2,取出data,data1,data2
            arrayName = expression.split('in')[1].replace(/\s/g, '').split('.'),
            parentNode = node.parentNode,
            startNode = document.createTextNode(''),
            endNode = document.createTextNode(''),
            range = document.createRange();

        // 替换原始node
        parentNode.replaceChild(endNode, node);
        parentNode.insertBefore(startNode, endNode);

        let value = vm;
        //得到数组的值
        arrayName.forEach(function (curVal) {
            value = value[curVal];
        });

        // 有多少数组就创造多少节点
        value.forEach(function (item, index) {
            let cloneNode = node.cloneNode(true);
            parentNode.insertBefore(cloneNode, endNode);
            //forvm原型继承vm，并且增加两个属性
            let forVm = Object.create(vm);
            // 增加$index下标
            forVm.$index = index;
            // 绑定item作用域
            forVm[itemName] = item;
            // 继续递归编译每个结点
            new Compiler(cloneNode, forVm);
        });

        new __WEBPACK_IMPORTED_MODULE_0__watcher__["a" /* default */](vm, arrayName + ".length", function (newValue, oldValue) {
            range.setStart(startNode, 0);
            range.setEnd(endNode, 0);
            range.deleteContents();
            value.forEach((item, index) => {
                let cloneNode = node.cloneNode(true);
                parentNode.insertBefore(cloneNode, endNode);
                let forVm = Object.create(this);
                // 增加$index下标
                forVm.$index = index;
                // 绑定item作用域
                forVm[itemName] = item;
                // 继续编译cloneNode
                new Compiler(cloneNode, forVm);
            });
        });

    },

    model: function (node, vm, expression) {
        this.bind(node, vm, expression, 'model');

        // 对于model做双向绑定
        let value = this._getVMVal(vm, expression);

        // compositon是针对中文输入的优化
        let composing = false;

        node.addEventListener('compositionstart', () => {
            composing = true;
        }, false);

        node.addEventListener('compositionend', event => {
            composing = false;
            if (value !== event.target.value) {
                this._setVMVal(vm, expression, event.target.value);
            }
        }, false);

        node.addEventListener('input', event => {
            if (!composing && value !== event.target.value) {
                this._setVMVal(vm, expression, event.target.value);
            }
        }, false);
    },

    bind: function (node, vm, expression, directive) {
        //得到指令对应的更新函数
        var updaterFn = updater[directive + 'Updater'];
        // 获取vm中的expression的值，会触发属性值的get函数
        let value = this._getVMVal(vm, expression);
        //给node更新值（不同指令不同的更新函数）
        updaterFn && updaterFn(node, value);
        // 监听该数据的值，给订阅者Watcher传入更新视图的回调函数
        new __WEBPACK_IMPORTED_MODULE_0__watcher__["a" /* default */](vm, expression, function (newValue, oldValue) {
            updaterFn && updaterFn(node, newValue, oldValue);
        });
    },

    addEvent: function (node, vm, directive, expression) {
        //用:将v-on:click中的on和click分割成数组
        let eventType = directive.split(':');
        //在vm实例中匹配对应的method函数
        let fn = vm.$options.methods && vm.$options.methods[expression];

        if (eventType[1] && typeof fn === 'function') {
            node.addEventListener(eventType[1], fn.bind(vm), false);
        } else {
            //处理带参数的method,对这里match的值不太懂的去看一下exec方法
            let match = paramsRE.exec(expression),
                //得到剔除参数后的函数名称
                fnName = expression.replace(match[0], ''),
                //参数数组
                paramNames = match[1].split(','),
                params = [];

            fn = vm.$options.methods[fnName];
            // 解析参数中的字符串参数以及data属性值的参数
            for (let i = 0; i < paramNames.length; i++) {
                let name = paramNames[i].trim(),
                    stringMatch = stringRE.exec(name);
                if (stringMatch) {
                    // 字符串常量
                    params.push(stringMatch[1]);
                } else {
                    // vm中变量
                    params.push(vm[name]);
                }
            }
            node.addEventListener(eventType[1], function () {
                fn.apply(vm, params);
            }, false);
        }
    },

    _getVMVal: function (vm, expression) {
        expression = expression.trim();
        let value = vm;
        expression = expression.split('.');
        expression.forEach((key) => {
            if (value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                throw new Error("can not find the property: " + key);
            }

        });

        if (typeof value === 'object') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    },

    _setVMVal: function (vm, expression, value) {
        expression = expression.trim();
        let data = vm._data;
        expression = expression.split('.');
        expression.forEach((key, index) => {
            if (index == expression.length - 1) {
                data[key] = value;
            } else {
                data = data[key];
            }
        });
    }
}

const cacheDiv = document.createElement('div');

const updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },

    htmlUpdater: function (node, value) {
        //当node为text节点时对应的流程（解析value到node里）
        if (node.$parent) {
            // {{{}}}html解析，传进来的node是一个空的fragment，得特殊处理
            cacheDiv.innerHTML = value;
            const childNodes = cacheDiv.childNodes,
                doms = [];
            let len = childNodes.length,
                tempNode;
            //html第一次更新进入的流程
            if (node.$oncetime) {
                while (len--) {
                    tempNode = childNodes[0];
                    node.appendChild(tempNode);
                    doms.push(tempNode);
                }
                node.$doms = doms;
                node.$oncetime = false;
            } else {
                // 在之后更新节点时进入的流程
                let newFragment = document.createDocumentFragment();
                while (len--) {
                    tempNode = childNodes[0];
                    newFragment.appendChild(tempNode);
                    doms.push(tempNode);
                }
                // 插入新的节点
                node.$parent.insertBefore(newFragment, node.$doms[0]);
                // 删除原来的节点
                node.$doms.forEach(childNode => {
                    node.$parent.removeChild(childNode);
                });
                // 保存新节点引用，下次用来删除
                node.$doms = doms;
            }

        } else {
            // v-html指令
            node.innerHTML = typeof value === 'undefined' ? '' : value;
        }
    },

    classUpdater: function (node, value, oldValue) {
        var nodeNames = node.className;
        if (oldValue) {
            nodeNames = nodeNames.replace(oldValue, '').replace(/\s$/, '');
        }
        var space = nodeNames && value ? ' ' : '';
        node.className = nodeNames + space + value;
    },

    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__watcher__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__observer__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__compiler__ = __webpack_require__(4);




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
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__observer__["a" /* default */])(this._data);
        //编译结点，解析各种指令，并且将每个node节点对应一个watcher身份，在收到通知时改变自身view视图
        this.$compiler = new __WEBPACK_IMPORTED_MODULE_2__compiler__["a" /* default */](options.el || document.body, this);
    }

    $watch (expression, callback) {
        new __WEBPACK_IMPORTED_MODULE_0__watcher__["a" /* default */](this, expression, callback);
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

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(3);


const arrayProto = Array.prototype;
//劫持后的方法
const arrayMethods = Object.create(arrayProto);
/* harmony export (immutable) */ __webpack_exports__["a"] = arrayMethods;


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
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["a" /* def */])(arrayMethods, method, function() {
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
        console.log(this)
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
        //如果监听的data中的对象有push,unshift,splice等添加新值的方法，就监听新加入的数组
        if (inserted) ob.observerArray(inserted);
        //每次使用数组方法，都触发数组对象的dep发布事件
        ob.dep.notify();
        return result+this;
    });
});

/***/ })
/******/ ]);