## ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter'] 有什么区别？
表单默认是两个按钮 搜索和重置，可以修改按钮text和是否展示，这四个slot是为了扩展表单的按钮操作

后面两个跟收起展开有关；
项目中目前没有用到后面两个；
除去以上两个，resetBefore一般放在了最右边，像保存或者取消，
submitBefore 一般是在最左边，创建并编排，上一步/下一步 等

顺序其实是：
submitBefore（slot） -- getSubmitBtnOptions（条件渲染） --- resetBefore（slot） --- getResetBtnOptions（条件渲染）
- advanceBefore（slot） - 收起/展开（条件渲染：showAdvancedButton && !hideAdvanceBtn） - advanceAfter（slot）

## 案例：业务编排-创建业务编排，为什么在submitBefore和submitafter之间还能放一个保存或者创建完成？
中间那个是通过submitButtonOptions 传入的。

## 组件库：getSubmitBtnOptions中为什么中间放了个搜索，而且在页面中并没有展示出来
```js
const getSubmitBtnOptions = computed(() => {
  return Object.assign(
    {},
    {
      text: '搜索',
      preIcon: 'ant-design:search-outlined'
    },
    props.submitButtonOptions
  )
})
```
表单内置的两个按钮，getSubmitBtnOptions默认是搜索，可以通过submitButtonOptions来修改这个属性

## 以上什么情况下用的？

默认是由两个按钮，一个搜索showSubmitButton一个重置showResetButton，可以修改他两的text;
而这几个slot是为了可以多几个按钮类型的操作；
submitBefore在搜索前，resetBefore在重置前
