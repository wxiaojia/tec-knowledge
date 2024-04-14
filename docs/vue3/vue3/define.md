## defineProps、withDefaults 类型设置、默认值设置

### 例子1 ： 运行时声明 的方式只能设置参数类型、默认值、是否必传、自定义验证。报错为控制台warn警告。
#### 若想设置[ 编辑器报错、编辑器语法提示 ]则需要使用类型声明的方式。

```js
<script lang='ts' setup>
const props = defineProps({
  child: {
    type:String, // 参数类型
    default: 1, //默认值
    required: true, //是否必传
    validator: value => {
      return value >= 0 // 除了验证是否符合type的类型，此处再判断该值结果是否符合验证
    }
  },
  sda: String, //undefined
  strData: String,
  arrFor: Array
})
</script>
```
子组件声明了的props ，若父组件未传，则该值为 undefined

### 例子2 > 类型声明的方式 defineProps 单独使用该api，只能设置是否必传和参数类型。（利用TS特性）
```js
<script lang='ts' setup>
const props = defineProps<{
  either: '必传且限定'|'其中一个'|'值', // 利用TS：限定父组件传 either 的值
  child?: string|number,
  strData?: string,
  arrFor: any[]
}>();
console.log(props);
</script>
```

相较于例子1，该写法只能设置参数类型、父组件对应 prop 是否该必传的功能。
传值有误时，控制台报warn警告，还提供编辑器报错功能。
提供编辑器代码提示的功能。

### 例子3 >类型声明的方式2：在类型方式1的基础上，增加了设置 prop 默认值
```js
<script lang='ts' setup>
interface Props {
  either: '必传且限定'|'其中一个'|'值', // 利用TS：限定父组件传 either 的值
  child: string|number,
  sda?: string, // 未设置默认值，为 undefined
  strData: string,
  msg?: string
  labels?: string[],
  obj?:{a:number}
}
const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
  obj: () => { return {a:2} }
})
</script>
```

> 注意：默认值为引用类型的，需要包装一个函数 return 出去。







