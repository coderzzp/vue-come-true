import Dep from './dep'

export default class Watcher {

    constructor(vm, expression, callback) {
        this.callback = callback;
        this.vm = vm;
        this.expression = expression;
        this.callback = callback;
        this.depIds = {};
        this.oldValue = this.get();
    }

    update () {
        let newValue = this.get();
        let oldValue = this.oldValue;
        if (newValue !== this.oldValue) {
            this.oldValue = newValue;
            this.callback.call(this.vm, newValue, oldValue);
        }
    }

    addDep (dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }

    get () {
        Dep.target = this;
        let value = this.getVMVal();
        Dep.target = null;
        return value;
    }

    getVMVal () {
        let expression = this.expression.split('.');
        let value = this.vm;
        expression.forEach(function (curVal) {
            value = value[curVal];
        });
        return value;
    }
}