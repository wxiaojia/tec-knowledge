Antd Form 是怎么实现的
要实现上面的方案需要解决三个问题：
- form表单钟的数据存储
- 如何对组件的数据进行校验？
- 如何更新组件的数据？
- 嵌套的form表单，外部发生变化，为什么里面的表单会触发校验？

## 如何对组件的数据进行校验？
### 两种方式:
- form.validate() 
执行form中的validateFields方法

- @validate="handleValidate"
其实执行的也是form中的validateFields方法；
怎么触发的呢？ 
在formItem中的validateRules方法触发
有change和blur事件的时候触发
把他放到了useProvideFormItemContext中,发现 provide(ContextKey, props);
那我们再去找inject(ContextKey),发现在useInjectFormItemContext中；
在找下useInjectFormItemContext，发现，大多数表单里的组件都有使用到useInjectFormItemContext
且在change blur事件的时候去触发他，
```js
const handleChange: CascaderProps['onChange'] = (...args) => {
    emit('update:value', args[0]);
    emit('change', ...args);
    formItemContext.onFieldChange();
};
const handleBlur: CascaderProps['onBlur'] = (...args) => {
    emit('blur', ...args);
    formItemContext.onFieldBlur();
};
```
### validateFields
- 前面去处理需要检验的字段
- validateRules
```js
const promise = field.validateRules({
    validateMessages: validateMessages.value,
    ...options,
});
// 使用示例，在formItem中传rules,
//  <a-form-item :name="['user', 'age']" label="Age" :rules="[{ type: 'number', min: 0, max: 99 }]">
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};
// type对应validateMessages中的键，其他属性对应内部的值
```


## 如何更新组件的数据？
setFieldsValue


## 嵌套的form表单，外部发生变化，为什么里面的表单会触发校验？
formItemInput中绑定了change和blur事件，如果触发会触发所有校验吗？

