## 4.0 版本的 Ant Design Vue 
提供了一套全新的定制主题方案。不同于 3.x 版本的 less 和 CSS 变量，有了 CSS-in-JS 的加持后，动态主题的能力也得到了加强，包括但不限于：

支持动态切换主题；
支持同时存在多个主题；
支持针对某个/某些组件修改主题变量；
...

## 主题
最小元素称为 Design Token。


### 预设算法
4.0 版本中默认提供三套预设算法，分别是默认算法 theme.defaultAlgorithm、暗色算法 theme.darkAlgorithm 和紧凑算法 theme.compactAlgorithm。
通过修改 ConfigProvider 中 theme 属性的 algorithm 属性来切换算法。

### 修改组件变量
各个组件也会开放自己的 Component Token 来实现针对组件的样式定制能力，

### 动态切换

### 局部主题，可以嵌套使用 ConfigProvider 来实现局部主题的更换