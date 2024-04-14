所谓响应式，就是当我们修改数据后，可以自动做某些事情；对应到组件的渲染，就是修改数据后，能自动触发组件的重新渲染。
Vue 3 实现响应式，本质上是通过 Proxy API 劫持了数据对象的读写，当我们访问数据时，会触发 getter 执行依赖收集；修改数据时，会触发 setter 派发通知。
接下来，我们简单分析一下依赖收集和派发通知的实现（Vue.js 3.2 之前的版本）。


## 依赖收集

```javascript
let shouldTrack = true
// 当前激活的 effect
let activeEffect
// 原始数据对象 map
const targetMap = new WeakMap()
function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 每个 target 对应一个 depsMap
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // 每个 key 对应一个 dep 集合
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    // 收集当前激活的 effect 作为依赖
    dep.add(activeEffect)
   // 当前激活的 effect 收集 dep 集合作为依赖
    activeEffect.deps.push(dep)
  }
}
```
未完




