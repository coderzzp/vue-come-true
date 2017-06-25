### 前言
vue是一个非常典型的MVVM框架，它的核心功能一是双向数据绑定系统，二是组件化开发系统。那么本文是以一种通俗易懂的的角度来实现一个简单
的双向数据绑定系统，如果你用过vue却对vue的实现原理不太清楚，或者没用过vue想学习vue那我相信看完本文你会的vue的实现有一个比较简单明确的了解。不过如果哪块有
错误，还望指出。
### 本文的实现目标：
input标签和{{text}}的内容与data中的text值保持一致，实现双向绑定
```javascript
    <div id="app">
        <input type="text" v-model="text">
        {{text}}
    </div>
```
```javascript
    var vm=new Vue({
        el:'app',
        data:{
            text:'hello world!'
        }
    })
```
### 分解任务（三步）
* model→view的初始化绑定<br/>
* view→model的绑定<br/>
* model→view的绑定<br/>
> 看不太懂？不要着急，接下来先一步一步分析每一步都具体做了什么再回头看
### Step1 : model→view的初始化绑定.
很简单，就是让v-mode="text"和{{text}}绑定到的data中text的值。这里会有两个函数帮我们做事情，一个是`node2Fragment`函数，帮我们取到结点，
一个是`compile`函数，操作我们取到的node结点的值去等于对应的data值，这样就完成了model到view的第一次初始化绑定。
```javascript
  function node2Fragment(node,vm){
      //这里是dom劫持，vue会新建一个文档片段来替换dom中本来的结点
      var flag=document.createDocumentFragment();
      //子节点
      var child;
      while(child=node.firstChild){
          //开始编译每个结点
          compile(child,vm);
          //appendchild方法会自动删除node对象的child结点
          flag.appendChild(child)
      }
      return flag;
  }
```
```javascript
  function compile(node,vm){
    var reg=/\{\{(.*)\}\}/;
    //节点类型为元素
    if(node.nodeType===1){
      var attr=node.attributes;
      for(var i=0;i<attr.length;i++){
        //匹配v-model这个属性名称
        if(attr[i].nodeName=='v-model'){
          var name=attr[i].nodeValue;
          //将data的值赋给gainode
          node.value=vm.data[name];
        }
      }
    };
    //节点类型为text
    if(node.nodeType===3){
      if(reg.test(node.nodeValue)){
        var name=RegExp.$1;
        name=name.trim();
        //将data的值赋给该node
        node.nodeValue=vm.data[name];
      }
    }
  }
```
```javascript
  //Vue对象
  function Vue(options){
    this.data=options.data;
    var id=options.el;
    var dom=node2Fragment(document.getElementById(id),this);
    //编译完成后，将dom片段添加到el挂载的元素上(app)
    document.getElementById(id).appendChild(dom)
  }
  //调用Vue
  var vm=new Vue({
      el:'app',
      data:{
          text:'hello world!'
      }
  })
```
最终达到的效果如下图：v-model绑定的input和{{text}}的值和data中的text保持一致<br/>
![](https://github.com/coderzzp/vue-come-true/blob/master/vue-come-true-First/img/QQ%E6%88%AA%E5%9B%BE20170603152333.jpg)
### Step2 : view→model的绑定.
这一步的目标：当用户输入改变input的值(view层)时，反映到data中(model层)并改变对应的值<br/>
方法：<br/>
* 在complie编译的时候监听node，并改变data中的值为node.value;
* 通知data中的数据改变（这里会用到访问器属性，即`Object.defineProperty`）<br/>
这里我们先完成第二个点，通知数据改变，在全局中新添加两个函数
```javascript
  function defineReactive(obj,key,val){
    Object.defineProperty(obj,key,{
      get:function(){
        return val
      },
      set:function(newVal){
        if(newVal===val)return ;
        val=newVal;
        //看到数据改变
        console.log("设置新的属性为"+val)
      }
    })
  }
  function observe(obj,vm){
    Object.keys(obj).forEach(function(key){
      defineReactive(vm,key,obj[key])
    })
  }
```
```javascript
  //Vue对象
  function Vue(options){
    this.data=options.data;
    var id=options.el;
    var data=this.data;
    //将data的属性全部通过访问器属性赋给vm对象，使读写vm实例的属性转成读写了vm.data的属性值，达到鱼目混珠的效果
    observe(data,this);
    var dom=node2Fragment(document.getElementById(id),this);
    //编译完成后，将dom片段添加到el挂载的元素上(app)
    document.getElementById(id).appendChild(dom)
  }
```
监听node(修改complie函数)
```javascript
  function compile(node,vm){
    var reg=/\{\{(.*)\}\}/;
    //节点类型为元素
    if(node.nodeType===1){
      var attr=node.attributes;
      for(var i=0;i<attr.length;i++){
        //匹配v-model这个属性名称
        if(attr[i].nodeName=='v-model'){
          var name=attr[i].nodeValue;
          node.addEventListener('input',function(e){
            //给对应的data属性赋值，并触发该属性的set函数
            vm[name]=e.target.value;
          });
          //将data值赋给该node,注意这里本来是vm.data[name]
          node.value=vm[name]
        }
      }
    };
    //节点类型为text
    if(node.nodeType===3){
      if(reg.test(node.nodeValue)){
        var name=RegExp.$1;
        name=name.trim();
        //将data的值赋给该node,注意这里本来是vm.data[name]
        node.nodeValue=vm[name];
      }
    }
  }
```
那么step2完成了，当用户在input中输入值，data属性值也会发生改变，这样一来就完成了model→view的一个实现过程<br/>
![](https://github.com/coderzzp/vue-come-true/blob/master/vue-come-true-First/img/QQ%E6%88%AA%E5%9B%BE20170603171244.jpg)<br/>
### Step3 : model→view的绑定
诶不是之前已经绑定过一次model→view，怎么还要绑定？<br/>
第一次绑定是初始化绑定，我们现在要完成的是，当用户改变data值，再回过头去改变view层，这里刚好可以用到一个设计模式：
观察者模式-让多个观察者同时监听某一个主题对象，这个主题对象的状态发生改变时就会通知所有观察者对象。<br/>
![](https://github.com/coderzzp/vue-come-true/blob/master/vue-come-true-First/img/925891-20161120160541513-1856723431.png)<br/>
放到这里就是：每个data属性值在`defineReactive`函数监听处理的时候，添加一个主题对象，当data属性发生改变,通过set函数去通知所有的观察者们，
那么如何添加观察者们呢，就是在`complie`函数编译node时，通过初始化value值，触发set函数，在set函数中为主题对象添加
观察者。有点难理解？直接看代码就明白了。
```javascript
  function compile(node,vm){
    var reg=/\{\{(.*)\}\}/;
    //节点类型为元素(这块在这里并没有修改)
    //节点类型为text
    if(node.nodeType===3){
      if(reg.test(node.nodeValue)){
        var name=RegExp.$1;
        name=name.trim();
        //初始化数据，并给对应的data属性值添加观察者
        new Watcher(vm,node,name); 
      }
    }
  }
```
我们注意到新建了一个Watcher对象，这个对象的作用就是初始化数据(step1做的工作)，以及触发get函数,添加这个node到观察者<br/>
```javascript
  function Watcher(vm,node,name){
    //Dep.target是一个Dep的静态属性,表示当前观察者。
    Dep.target=this;
    this.name=name;
    this.node=node;
    this.vm=vm;
    //订阅者执行一次更新视图
    this.update();
    Dep.target=null;
  }
  Watcher.prototype={
    update:function(){
      //触发对应data属性值的get函数
      this.get();
      this.node.nodeValue=this.value;
    },
    get:function(){
      this.value=this.vm[this.name]
    }
  }
```
观察者设置好了，现在设置主题，在`defineReactive`函数里
```javascript
  function defineReactive(obj,key,val){
    //定义一个主题
    var dep=new Dep();
    Object.defineProperty(obj,key,{
      get:function(){
        //添加订阅者watcher到主题对象Dep
        if(Dep.target)dep.addSub(Dep.target)
        return val
      },
      set:function(newVal){
        if(newVal===val)return ;
        val=newVal;
        //作为发布者发出通知（更新所有订阅了这个属性的view）
        dep.notify();
      }
    })
  }
```
主题的结构：
```javascript
  function Dep(){
    //主题的订阅者们
    this.subs=[];
  }
  Dep.prototype={
    //添加订阅者的方法
    addSub:function(sub){
      this.subs.push(sub);
    },
    //发布信息的方法（让订阅者们全部更新view）
    notify:function(){
      this.subs.forEach(function(sub){
        sub.update();
      })
    }
  }
```
如此一来，一个简单的MVVM就实现了，思维导图如下：<br/>
![](https://github.com/coderzzp/vue-come-true/blob/master/vue-come-true-First/img/132184689-57b310ea1804f_articlex.png)<br/>
不过这只是Vue的冰山一角，只是实现了一个v-model，陆陆续续会更新其他的操作和一些细节，敬请期待，如果你
看完了并且有所收获不妨点个star(滑稽脸)















