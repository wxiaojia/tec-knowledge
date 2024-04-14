## 介绍
Pinia 是 Vue.js 的轻量级状态管理库，最近很受欢迎。它使用 Vue 3 中的新反应系统来构建一个直观且完全类型化的状态管理库。
设置：
Pinia 很容易上手，因为它只需要安装和创建一个store。
要安装 Pinia，您可以在终端中运行以下命令：
```js
yarn add pinia@next
# or with npm
npm install pinia@next
```

Pinia是一个围绕Vue 3 Composition API的封装器。因此，你不必把它作为一个插件来初始化，除非你需要Vue devtools支持、SSR支持和webpack代码分割的情况：
```js
//app.js
import { createPinia } from'pinia'
app.use(createPinia())
```

为了创建一个store，你用一个包含创建一个基本store所需的states、actions和getters的对象来调用 defineStore 方法。
```js
// stores/todo.js
import { defineStore } from'pinia'

exportconst useTodoStore = defineStore({
  id: 'todo',
  state: () => ({ count: 0, title: "Cook noodles", done:false })
})
```
使用：
```js
exportdefault defineComponent({
  setup() {
    const todo = useTodoStore()

    return {
      // 只允许访问特定的state
      state: computed(() => todo.title),
    }
  },
})
```

## 比较 Pinia 2 和 Vuex 4
### Pinia 将这些与 Vuex 3 和 4 进行了比较：
* 突变不再存在。他们经常被认为非常冗长。他们最初带来了 devtools 集成，但这不再是问题。
* 无需创建自定义的复杂包装器来支持 TypeScript，所有内容都是类型化的，并且 API 的设计方式尽可能地利用 TS 类型推断。


这些是Pinia在其状态管理库和Vuex之间的比较中提出的额外见解：
* Pinia 不支持嵌套存储。相反，它允许你根据需要创建store。但是，store仍然可以通过在另一个store中导入和使用store来隐式嵌套
* 存储器在被定义的时候会自动被命名。因此，不需要对模块进行明确的命名。
* Pinia允许你建立多个store，让你的捆绑器代码自动分割它们
* Pinia允许在其他getter中使用getter
* Pinia允许使用 $patch 在devtools的时间轴上对修改进行分组。

## Vuex 和 Pinia 的优缺点
### Vuex的优点
* 支持调试功能，如时间旅行和编辑
* 适用于大型、高复杂度的Vue.js项目

### Vuex的缺点
* 从 Vue 3 开始，getter 的结果不会像计算属性那样缓存
* Vuex 4有一些与类型安全相关的问题

### Pinia的优点
* 完整的 TypeScript 支持：与在 Vuex 中添加 TypeScript 相比，添加 TypeScript 更容易
* 极其轻巧（体积约 1KB）
* store 的 action 被调度为常规的函数调用，而不是使用 dispatch 方法或 MapAction 辅助函数，这在 Vuex 中很常见
* 支持多个Store
* 支持 Vue devtools、SSR 和 webpack 代码拆分

### Pinia的缺点
* 不支持时间旅行和编辑等调试功能

## 何时使用Pinia，何时使用Vuex
由于Pinea是轻量级的，体积很小，它适合于中小型应用。它也适用于低复杂度的Vue.js项目，因为一些调试功能，如时间旅行和编辑仍然不被支持。
将 Vuex 用于中小型 Vue.js 项目是过度的，因为它重量级的，对性能降低有很大影响。因此，Vuex 适用于大规模、高复杂度的 Vue.js 项目。









