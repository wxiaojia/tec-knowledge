# 该文件功能
item单项：
- width大小
- value值
- componentProps
- disabled
- show/ifshow
- handleRules,规则处理(只是返回一个rule，没有执行)
- renderComponent 渲染后面的组件，根据不同组件，手动去挂载事件
- renderLabelHelpMessage 渲染前面的label
- renderItem 渲染整个（前缀、后缀、。。。）


# 以下为问题
## as Recordable
### 什么是Recordable
不是ts内置的类型；自定义的
```js
type Recordable<T = any> = Record<string, T>;
```
### 使用：
```js
const obj: Recordable<number> = {
  a: 1,
  b: 2,
  c: 3,
};

const strObj: Recordable<string> = {
  name: 'Alice',
  age: '25',
};
```
解释：
Recordable<number> 表示一个键为 string，值为 number 类型的对象，
而 Recordable<string> 表示键为 string，值为 string 类型的对象

### 何时使用：
动态对象：当你需要处理动态键名和类型不确定的对象时，可以使用 Recordable 类型。
避免显式的类型声明：如果你希望你的对象能够存储任意键和值，而不需要明确声明每个属性的类型时，Recordable 提供了一个灵活的方案。

## 为什么componentProps可以是对象，也可以是函数？
```js
componentProps = componentProps({ schema, tableAction, formModel, formActionType, baseMaxLength }) ?? {}
```
把prop数据源传入，可以在函数中使用：
```js
componentProps: ({ formModel }) => {
    return {
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        showTime: { defaultValue: dayjs('00:00:00', 'HH:mm:ss') },
        style: 'width:100%;',
        disabledDate: (currentDate) => {
        return disabledSingleSchedulingTime(currentDate, formModel.isHis)
        }
    }
},
```