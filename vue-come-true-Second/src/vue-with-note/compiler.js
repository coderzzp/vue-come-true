import Watcher from './watcher';
import observer from './observer';

const tagRE = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g,
    htmlRE = /^\{\{\{(.*)\}\}\}$/,
    paramsRE = /\((.+)\)/g,
    stringRE = /\'(.*)\'/g;


export default class Compiler {

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
                    // 只是为了流程控制，继续往下看
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
            // 如果是文本 value存放文本信息，如果tag为true表示是一个节点，存放expression
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

    // 是不是vue指令
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

        new Watcher(vm, arrayName + ".length", function (newValue, oldValue) {
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
        new Watcher(vm, expression, function (newValue, oldValue) {
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
