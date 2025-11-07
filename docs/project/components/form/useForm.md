# useForm
暴露给外部的方法，内部调用useFormEvents，form的事件等

## ts解析
```js
type Props = Partial<DynamicProps<FormProps>>
```
Partial 所有属性都是可选

问题：
## register什么时候执行，参数从哪里来, register主要做了什么
主要做：
```js
  function register(instance: FormActionType) {
    onUnmounted(() => {
      formRef.value = null
      loadedRef.value = null
    })
    if (unref(loadedRef) && instance === (unref(formRef) as any)) return

    formRef.value = instance as any
    loadedRef.value = true

    watch(
      () => props,
      () => {
        props && instance.setProps(getDynamicProps(props))
      },
      {
        immediate: true,
        deep: true
      }
    )
  }
```
注册一个表单实例，并在组件卸载时进行清理。同时，它还监听 props 的变化，并在变化时更新表单实例的属性。
使用：在basic-form中：
```js
onMounted(() => {
  initDefault()
  emit('register', formActionType)
})
```

