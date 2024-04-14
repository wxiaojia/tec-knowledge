
## 1、生命周期的变化：
整体来看，变化不大，只是名字大部分需要 + on，功能上类似。使用上 Vue3 组合式 API 需要先引入；Vue2 选项 API 则可直接调用
Vue2.x    | Vue3
-------------| ------
beforeCreate | --
created      | --
beforeMount  | onBeforeMount
mounted      | onMounted
beforeUpdate | onBeforeUpdate
updated      | onUpdated
beforeDestroy| onBeforeUnmount
destroyed    | onUnmounted

> Tips： setup是围绕beforeCreate和created生命周期钩子运行的，所以不需要显式地去定义。

## 2、多根节点
Vue3 支持了多根节点组件，也就是fragment。

## 3、异步组件
Vue3 提供 Suspense组件，允许程序在等待异步组件时渲染兜底的内容，如 loading ，使用户体验更平滑。使用它，需在模板中声明，并包括两个命名插槽：default和fallback。Suspense确保加载完异步内容时显示默认插槽，并将fallback插槽用作加载状态。
```html
<tempalte>
   <suspense>
     <template #default>
       <todo-list />
     </template>
     <template #fallback>
       <div>
         Loading...
       </div>
     </template>
   </suspense>
</template>
```
真实的项目中踩过坑，若想在 setup 中调用异步请求，需在 setup 前加async关键字。这时，会受到警告async setup() is used without a suspense boundary。

解决方案：在父页面调用当前组件外包裹一层Suspense组件。

## 4、Teleport
Vue3 提供Teleport组件可将部分DOM移动到 Vue app之外的位置。比如项目中常见的Dialog组件。
```js
<button @click=dialogVisible = true>点击</button>
<teleport to=body>
   <div class=dialog v-if=dialogVisible>
   </div>
</teleport>
```
## 5、组合式API
Vue2 是 选项式API（Option API），一个逻辑会散乱在文件不同位置（data、props、computed、watch、生命周期函数等），导致代码的可读性变差，需要上下来回跳转文件位置。Vue3 组合式API（Composition API）则很好地解决了这个问题，可将同一逻辑的内容写到一起。

除了增强了代码的可读性、内聚性，组合式API 还提供了较为完美的逻辑复用性方案，举个🌰，如下所示公用鼠标坐标案例。
// main.vue
```js
<template>
  <span>mouse position {{x}} {{y}}</span>
</template>

<script setup>
import { ref } from 'vue'
import useMousePosition from './useMousePosition'

const {x, y} = useMousePosition()
}
</script>
```
// useMousePosition.js
```js
import { ref, onMounted, onUnmounted } from 'vue'

function useMousePosition() {
  let x = ref(0)
  let y = ref(0)
  
  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', update)
  })
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })
  
  return {
    x,
    y
  }
}
</script>
```
解决了 Vue2 Mixin的存在的命名冲突隐患，依赖关系不明确，不同组件间配置化使用不够灵活。

## 6、响应式原理
Vue2 响应式原理基础是Object.defineProperty；Vue3 响应式原理基础是Proxy。

object.definedProperty
基本用法：直接在一个对象上定义新的属性或修改现有的属性，并返回对象。

> Tips： writable 和 value 与 getter 和 setter 不共存。
```js
let obj = {}
let name = '瑾行'
Object.defineProperty(obj, 'name', {
  enumerable: true, // 可枚举（是否可通过for...in 或 Object.keys()进行访问）
  configurable: true, // 可配置（是否可使用delete删除，是否可再次设置属性）
  // value: '', // 任意类型的值，默认undefined
  // writable: true, // 可重写
  get: function() {
    return name
  },
  set: function(value) {
    name = value
  }
})
```
搬运 Vue2 核心源码，略删减:
```js
function defineReactive(obj, key, val) {
  // 一 key 一个 dep
  const dep = new Dep()
  
  // 获取 key 的属性描述符，发现它是不可配置对象的话直接 return
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) { return }
  
  // 获取 getter 和 setter，并获取 val 值
  const getter = property && property.get
  const setter = property && property.set
  if((!getter || setter) && arguments.length === 2) { val = obj[key] }
  
  // 递归处理，保证对象中所有 key 被观察
  let childOb = observe(val)
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // get 劫持 obj[key] 的 进行依赖收集
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if(Dep.target) {
        // 依赖收集
        dep.depend()
        if(childOb) {
          // 针对嵌套对象，依赖收集
          childOb.dep.depend()
          // 触发数组响应式
          if(Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
    }
    return value
  })
  // set 派发更新 obj[key]
  set: function reactiveSetter(newVal) {
    ...
    if(setter) {
      setter.call(obj, newVal)
    } else {
      val = newVal
    }
    // 新值设置响应式
    childOb = observe(val)
    // 依赖通知更新
    dep.notify()
  }
}
```
那 Vue3 为何会抛弃它呢？那肯定是有一些缺陷的。
主要原因：无法监听对象或数组新增、删除的元素。
Vue2 方案：针对常用数组原型方法push、pop、shift、unshift、splice、sort、reverse进行了hack处理；提供Vue.set监听对象/数组新增属性。对象的新增/删除响应，还可以new个新对象，新增则合并新属性和旧对象；删除则将删除属性后的对象深拷贝给新对象。

以 baseHandlers.ts 为例，使用Reflect.get而不是target[key]的原因是receiver参数可以把this指向getter调用时，而非Proxy构造时的对象。

## 7、虚拟dom
Vue3 相比于 Vue2 虚拟DOM 上增加patchFlag字段。

## 8、diff 优化
，patchFlag帮助 diff 时区分静态节点，以及不同类型的动态节点。一定程度地减少节点本身及其属性的比对。

## 9、打包优化
tree-shaking：模块打包webpack、rollup等中的概念。移除 JavaScript 上下文中未引用的代码。主要依赖于import和export语句，用来检测代码模块是否被导出、导入，且被 JavaScript 文件使用。

以nextTick为例子，在 Vue2 中，全局 API 暴露在 Vue 实例上，即使未使用，也无法通过tree-shaking进行消除。
```js
import Vue from 'vue'

Vue.nextTick(() => {
  // 一些和DOM有关的东西
})
```
Vue3 中针对全局 和内部的API进行了重构，并考虑到tree-shaking的支持。因此，全局 API 现在只能作为ES模块构建的命名导出进行访问。
```js
import { nextTick } from 'vue'

nextTick(() => {
  // 一些和DOM有关的东西
})
```

## 10、ts支持
Vue3 由TS重写，相对于 Vue2 有更好地TypeScript支持。
* Vue2 Option API中 option 是个简单对象，而TS是一种类型系统，面向对象的语法，不是特别匹配。
* Vue2 需要vue-class-component强化vue原生组件，也需要vue-property-decorator增加更多结合Vue特性的装饰器，写法比较繁琐。








