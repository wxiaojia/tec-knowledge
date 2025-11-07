重难点:
1.组件库、通用库架构设计
2.组件库方案选型与细节设计与实现
3.组件库构建发布与持续迭代


# 【初中级】开发过组件库吗，请说说你的设计与开发思路(要细节)?
## 架构设计
- 分层
    - rC-XXX，提供基础组件，unstyledcomponent(headless)，只具备功能交互不具备UI表现
    - 样式体系，theming 
    - 基础组件
    - 复合组件，Search，Input+Select,IconButton Icon + Button
    - 业务组件，
- 解耦
    - 对于每个组件都需要定义样式、ts类型、基础操作、工具方法
- 响应式设计
    - 媒体查询 media query、Resize0bserver、Grid

## 状态管理
- 全局状态，基础配置、国际化配置、主题配置，react→Context、useSyncExternalStore，vue → vue-demi-
- 局部状态，表单场景，受控和非受控(状态是否跟表单值双向奔赴)input value={v}onchange={()= setV}





# 【中高级】请从零到一实现一个组件库基础框架


# 【专家级】如果让你架构设计一个类似 Ant Design 组件库，如何设计并落地?