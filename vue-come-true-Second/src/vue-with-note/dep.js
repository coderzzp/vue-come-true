import Watcher from './watcher';

let uid = 0;

export default class Dep {
    static target;

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
        // 订阅者收到更新，然后通知订阅者watcher去更新视图
        this.subs.forEach(sub => sub.update());
    }
}