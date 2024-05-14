getCurrentInstance 获取父元素内容
```js
import { defineComponent, computed, getCurrentInstance } from 'vue'
 setup: function (props, context) {
    const colStyle = computed(() => {
      let {parent} = getCurrentInstance()
      while (parent && parent.type.name !== 'LcRow') {
        parent = parent.parent
      }
      const colGutter : any = parent ? parent.props.gutter : 0
      return {
        paddingLeft: colGutter / 2 + 'px',
        paddingRight: colGutter / 2 + 'px',
      }
    })
    return {
     colStyle
    }
  }
```

为什么不使用?.
* 由于Vu3打包后的代码是基于ES2016的，虽然我们在编写代码时看起来代码比较简洁了，实际打包之后反而更冗余了，这样会增大包的体积，影响Vue3的加载速度。

由此可见一个优秀的前端框架真的要考虑的东西很多，语法也会考虑周到～✨