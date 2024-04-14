## 一、区别：
1. Performance：性能更强。
2. Tree shaking support：可以将无用模块“剪辑”，仅打包需要的。
3. Composition API：组合式API
4. Fragment, Teleport, Suspense：“碎片”，Teleport即Protal传送门，“悬念”
5. Better TypeScript support：更优秀的Ts支持
6. Custom Renderer API：暴露了自定义渲染API

* 为什么要大版本迭代 （Why）
1. 主流浏览器对新的JavaScript语言特性的普遍支持。
2. 当前Vue代码库随着时间的推移而暴露出来的设计和体系架构问题。
* 他是如何提升的（How）
1. 响应式系统提升： 使用Proxy提升了响应式的性能和功能
2. 编译优化： 标记和提升所有的静态节点，diff时只需要对比动态节点内容
3. 事件缓存： 提供了事件缓存对象cacheHandlers，无需重新创建函数直接调用缓存的事件回调
4. 打包和体积优化： 按需引入，Tree shaking支持（ES Module）

## 二、修改
2.x 全局 API     | 3.x 实例 API (app)
----------------| --------------------
Vue.config      | app.config
Vue.config.productionTip    | 无
Vue.config.ignoredElements  | app.config.isCustomElement
Vue.component   | app.component
Vue.directive   | app.directive
Vue.mixin       | app.mixin
Vue.use         | app.use
Vue.prototype   | app.config.globalProperties

### 1、config.ignoredElements -> config.isCustomElement
引入此配置选项的目的是支持原生自定义元素，因此重命名可以更好地传达它的功能，新选项还需要一个比旧的 string/RegExp 方法提供更多灵活性的函数：
```javascript
// Vue2
Vue.config.ignoredElements = [
  // 用一个 `RegExp` 忽略所有“ion-”开头的元素
  // 仅在 2.5+ 支持
  /^ion-/
]

// Vue3
const app = Vue.createApp({})
app.config.isCustomElement = tag => tag.startsWith('ion-')
```
### 2、vue.prototype -> app.globalProperties
```js
// Vue2
Vue.prototype.$http = () => {}

// Vue3
const app = Vue.createApp({})
app.config.globalProperties.$http = () => {}
```
### 3、生命周期

2.0生命周期     | 3.0生命周期
--------------------------------| --------------------
beforeCreate(组件创建之前)      | setup()
created(组件创建完成)           | setup()
beforeMount(组件挂载之前)       | onBeforeMount(组件挂载之前)
mounted(组件挂载完成)           | onMounted(组件挂载完成)
beforeUpdate(数据更新，虚拟DOM打补丁之前) | onBeforeUpdate(数据更新，虚拟DOM打补丁之前)
updated(数据更新，虚拟DOM渲染完成) | onUpdated(数据更新，虚拟DOM渲染完成)
beforeDestroy(组件销毁之前)     | onBeforeUnmount(组件销毁之前)
destroyed(组件销毁之后)         | onUnmounted(组件销毁之后)
activated(被 keep-alive 缓存的组件激活时调用) | onActivated(被激活时执行)
deactivated(被 keep-alive 缓存的组件停用时调用) | onDeactivated(比如从 A 组件，切换到 B 组件，A 组件消失时执行)
errorCaptured(当捕获一个来自子孙组件的错误时被调用) | onErrorCaptured(当捕获一个来自子孙组件的异常时激活钩子函数)
### 4、hooks

### 5、响应式计算和侦听
Computed:
```js
const count = ref(1)

/*不支持修改【只读的】 */
const plusOne = computed(() => count.value + 1)
plusOne.value++ // 错误！

/*【可更改的】 */
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1
  },
})
```
watch:
```js
 // 直接侦听一个 ref
const count = ref(0)

watch(count, (count, prevCount) => {
  /* ... */
})

// 也可以使用数组来同时侦听多个源
watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
  /* ... */
})
```
WatchEffect:
* 定义：在响应式地跟踪其依赖项时立即运行一个函数，并在更改依赖项时重新运行它
* 第一个参数：effect，顾名思义，就是包含副作用的函数。如下代码中，副作用函数的作用是：当 count 被访问时,随即在控制台打出日志。
* 返回值：也是一个函数，显式调用可以清除watchEffect，组件卸载时会被隐式调用
```js
const count = ref(0);

const stop = watchEffect(() => console.log(count.value)); // -> logs 0

setTimeout(() => {
  count.value++; // -> logs 1
}, 100);

// 清除watchEffect
stop();
```

* 清除副作用（onInvalidate）
watchEffect 的第一个参数——effect函数——自己也有参数：叫onInvalidate，也是一个函数，用于清除 effect 产生的副作用。
onInvalidate 被调用的时机很微妙：它只作用于异步函数，并且只有在如下两种情况下才会被调用：
1. 当 effect 函数被重新调用时
2. 当监听器被注销时（如组件被卸载了）

```js
import { asyncOperation } from "./asyncOperation";

const id = ref(0);
watchEffect((onInvalidate) => {
  const token = asyncOperation(id.value);
  // onInvalidate 会在 id 改变时或停止侦听时，取消之前的异步操作（asyncOperation）
  onInvalidate(() => {
    token.cancel();
  });
});
```

* 第二个参数：options
主要作用是指定调度器，即何时运行副作用函数。
```js
// fire before component updates
watchEffect(
  () => {
    /* ... */
  },
  {
    flush: "pre",
    onTrigger(e) {
      // 依赖项变更导致副作用被触发时，被调用
      debugger;
    },
    onTrack(e) {
      // 依赖项变更会导致重新追踪依赖时，被调用【调用次数为被追踪的数量】
   debugger
    },
  }
);
```











