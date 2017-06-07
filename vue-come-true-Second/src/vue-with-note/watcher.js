import Dep from './dep'
//watcher观察者对象
export default class Watcher {

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
        let newValue = this.get();
        let oldValue = this.oldValue;
        if (newValue !== this.oldValue) {
            // 更新备份，准备下次对比
            this.oldValue = newValue;
            // 执行回调更新视图
            this.callback.call(this.vm, newValue, oldValue);
        }
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
        Dep.target = this;
        // 求值的过程会触发vm属性值的getter
        let value = this.getVMVal();
        // 访问完了，置空
        Dep.target = null;
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