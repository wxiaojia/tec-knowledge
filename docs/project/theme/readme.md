## gendo-ui-vue3组件库获取项目主题色方案

### 方案一：CSS 变量 + getComputedStyle
#### 1、 index2组件库获取项目主题色；

#### 2、项目中需要把less变量转化成css 变量
```less
// 项目主题文件: custom-theme.less
// 假设你使用 Less
@primary-color: #2563eb;
@text-color: #333;

// 将 Less 变量映射为 CSS 变量
:root {
  --g-primary-color: @primary-color;
  --g-text-color: @text-color;
  // ... 其他变量
}
```
然后在项目main.js中引入以上less文件；

#### 3、在组件库中组件使用，需要调用useThemeVars(),
Q: 为什么不能在全局调用？
它的设计目标就是让组件库的所有组件都能独立、一致地获取到当前的主题样式。
独立性：每个组件是独立的单元，它应该自己负责获取所需的主题变量，而不是依赖父组件传递。
可复用性：无论 MyButton 被放在项目的哪个层级，它都能正确获取主题，无需父组件配合。
响应式更新：useThemeVars 返回的是一个 ref，当 CSS 变量变化时（比如动态切换主题），themeVars.value 会更新，组件的样式也会自动更新（通过 computed 或 v-bind）。


### 方案而：项目调用组件库的 API 注册变量（混合模式）
#### 1、index组件库中获取项目主题色，或设置默认，一个插件

#### 2、在lib中注册组件时，注册插件
```js

// 全局动态添加组件
const install = (app: App): void => {
  components.forEach((component) => {
    component.name && app.component(component.name, component)
  })
  app.use(ThemePlugin);

  app.config.globalProperties.$notification = notification
}

export default {
  install
}
```

#### 3、在项目根组件中，调用接口注入组件库中需要的变量
```js
const projectVars = {
  primaryColor: '#2563eb' // 主色
}
provideProjectVars(projectVars) // 注入变量
onMounted(() => {
  const { appContext } = getCurrentInstance()!
  appContext.config.globalProperties.$syncTheme() // 需提前在 ThemePlugin 中暴露该方法
})

```
也可以不注入，使用组件库中默认的；

如果需要注入的变量的话，在项目中注入添加，在组件库中theme/vars中添加默认的，。
如果不设置默认的，组件中怎么设置默认颜色呢？
```css
.switch-text {
  color:  var(--g-primary-color, #1890ff);
}
```
var的第二个参数设置明确的颜色值

### 方案三：项目暴露一个全局变量，组件库读取（简单直接）
1、在项目中将变量映射，放到根上，并在main中引入
```css
@primary-color: #2563eb;
@text-color: #333;

 /* 将 Less 变量映射为 CSS 变量 */
:root {
  --g-primary-color: @primary-color;
  --g-text-color: @text-color;
   /* ... 其他变量 */
}
```
2、在组件库中可以直接使用
```css
.switch-text {
  color:  var(--g-primary-color, #1890ff);
}
```


以上三种比较：
方案一：CSS 变量 + getComputedStyle	⭐⭐⭐⭐⭐	最推荐。现代、灵活、与构建工具无关。要求项目将 modifyVars 映射为 CSS 变量。
方案二：全局变量	⭐⭐⭐	简单项目，快速集成。不推荐长期使用。
方案三：API 注册	⭐⭐⭐⭐	如果你希望组件库有更强的控制权，且项目方愿意配合调用 API。