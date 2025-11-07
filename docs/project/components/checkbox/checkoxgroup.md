
# checkbox全选封装

思考：
- 名字会不会太长了
- 或者改成g-checkbox-group带全选属性，selectAll: true?
×
- ？表单中的选择，有没有全选，找了下貌似没有，只有单选或者多选，符合现在组件库里的radio-checkbox要求  ×
- 看一下字节组件库的有没有这样的功能：没有封装全选功能 ×

### 结果
使用：直接带有全选功能
第一种：  <CheckboxGroupWithSelectAll
            :options="options"
            :defaultValue="['1']"
            @change="handleChange"
            />
第二种：
<g-checkbox-group :selectAll="true" :selectAnti="true" :max="10">
其他属性事件同a-checkbox&a-checkbox-group

- 封装全选hook   ✔
- 封装含全选组件
    - 反选功能 selectAnti，默认文字：反选 ✔
    - 全选功能 selectAll，默认文字：全选 - （进度：06周四，默认了全选, 07周五，可传参）✔
    - 设置最大值，如10个数据，最大勾选5个，等于5个时，其他复选框不可选，小于5时都可选 max，没有默认就不限制 ✔
    - 样式设置，可带入类
- 不能影响当前form表单中使用的，但也可满足以上要求吧（那就在原组件上添加功能）
- 先新封装一个吧，再看需不需要结合到原先的组件中✔

### 过程

组件库已有了g-checkbox-group
radio-group和checkbox-group 单选和双选

组件库已有且如果继续要此功能，比较倾向于添加属性selectAll
但那个组件创建是为表单提供的，且里面的属性有限，只有绑定的，没有change事件及其他属性，考虑是否直接在那加上，或者重开一个

分开了

### 收集下项目里用到的：
F:\frontend-web\src\components\Common\TimeRange\day-of-week.vue，
F:\frontend-web\src\components\Common\TimeRange\month.vue
F:\frontend-web\src\components\Common\TimeRange\week.vue
<div class="work-copy-popover">
    复制到
    <a-checkbox class="right ml-xs" :checked="checkAll" @change="onCheckAllChange">全选</a-checkbox>
</div>
<a-checkbox-group v-model:value="checkedList" :options="workListOptions" @change="onChange" />

加一个功能：反选
总结下来，其实项目中用到的全选比较少，有一些直接用的是tree，不是checkbox选择


### 问题：
#### Q:为什么会执行两次外部传来的change?
A:因为直接赋予属性使用curProps,会传入外面的change,然后在内部执行change时又emit了一次；所以执行了两次外部的change

#### Q:解决1后，还存在问题：输入中文时，也是两次change？
A: 一次input,一次CompositionEvent;antd内的input也存在这个问题，可以看下源码，为什么调了两次

#### 
前提：传入了change；
情况1：
在props中接收change,attrs不会收到change(接收除props的参数)，所以只接收到一个change;在赋值时去除，用内部的change去触发外部的change


    父  props   attrs   omit(去除change)  onchange  触发次数   位置
    ✔   ✔       ×       ×                  ×         1         props
    ✔   ✔       ×       ✔                  ×         0
    ✔   ✔       ×       ✔                  ✔        1         onchange
    ✔   ×       ✔       ×                  ×         1        attrs
    ✔   ×       ✔       ×                  ✔         2         onchange attrs
    ✔   ×       ✔       ✔                 ×         2（为什么） 已经omit去除了，且不传onchange(因为自动继承，会把change传入，但是为什么触发的是两次)
               
情况2：
如果不在props中接收，props中没有change,在attrs中接收到onChange,
那赋值时使用omit去除，为什么还存在两个？

情况3：
放入参数，props不接收，attrs接收，但是去除onchange给到input,且onChange注释掉，这时候理论上不存在change方法，为什么外部change还会被触发


F:\frontend-web\src\views\marker\multiPerson\review.vue  人工标注-详情-审核 全选，全选当前页
F:\frontend-web\src\views\data\database\detail.vue  数据管理-数据集详情 全选当前页
F:\frontend-web\src\components\system-manage\role\device-auth\add-camera-device-page.vue 角色-授权-设备权限选择 选择当前页、反选
F:\frontend-web\src\components\marker\review\batch\index.vue
F:\frontend-web\src\components\data\database\smartSearch\right-img-list.vue
F:\frontend-web\src\components\data\database\smartSearch\polymerize-public.vue


全选：
入：总数据
出：总数

全选当前页：
入：当前页数据
出：当前页总数