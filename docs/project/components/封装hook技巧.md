## 封装技巧 - Hook 返回值

1、一般自定义 Hook 有返回数组的，也有返回对象的，上面 useTable 使用了返回数组的写法，useMouse 使用了返回对象的写法。数组是对应位置命名的，可以方便重命名，对象对于类型和语法提示更加友好。两种写法都是可以替换的。
2、因为 Hook 返回对象或者数组，那么它一定是一个非 async 函数（async 函数一定返回 Promise），所以在 Hook 中，一般使用 then 而不是 await 来处理异步请求。
3、返回值如果是对象，一般在函数中通过 reactive 创建一个对象，最后通过 toRefs 导出，这样做的原因是可以产生批量的可以解构的 Ref 对象，以免在解构返回值时丢失响应性。

```js
// 使用 reactive 和 toRefs 可以快速创建多个ref对象，并在解构后使用时不丢失其响应性和与原先数据的关联性
function usePaginaion(){
	const pagination = reactive({
		current: 1,
		total: 0,
		sizeOption,
		size: sizeOption[0]
	})
	...
	return {...toRefs(pagination)}
}

const { current,total } = usePagination()
```

### 接口传参-定义时
我们还可以让我们的 api 接受参数。但是如何实现？还需要考虑一下。
首先我们想一想那里可以接受 api 的参数？

```js
const params = {
	id:2
}

// api本身
getTableDataApi({limit:3,page:2,...params})

// useTable也可以接受参数
const [data,refresh]=useTable(getTableDataApi,params,api)

// refresh也可以接受参数
refresh(params)
```
从使用上看，我们在 refresh 上接受参数，和我们在 getTableDataApi 的使用上感觉是最相似的，
因为 refresh 本来就是在 api 的基础上增加 then 维护了页数而已。但是我们还是先从 useTable 传参开始讲起，最后我们两种方式都可以接受！

### 方案一：在调用 useTable 的时候就接受参数，在 useTable 内部将这个参数传给 refresh。
存在问题：如果我们传入的是值类型，那么这个值会被拷贝过去，并传给 refresh，后续调用 refresh，都是不变的参数。
只适合需要传参但参数之后都不会变的接口，比如接受当前用户的 id。如果参数会变，这种方法是不行的。
```js
function useTable(api,id,options){
	...
	const refresh=()=>api(id).then(res=>data=res)
	return [data,refresh]
}

const [data,refresh]=useTable(api,id)
refresh()
refresh() // 都是id=2
```

如果我们传入的是引用类型，那么在后续调用中，我们可以通过改变对象的属性值来改变 refresh 的参数
（但是需要一些技巧，因为我们需要和分页参数进行结合）。
```js
const params = { id:12 }
function useTable(api,params,options){
	...
	// 错误，使用解构会丢失与原来对象的联系，导致原来的对象params更改，但这里仍使用旧值。
	const refresh=()=>api({[options.path.size]:pagination.size,[options.path.page]:pagination.page,...params}).then(res=>data=res)
	// 正确，可以保持与外部params的联系。
	const refresh=()=>api(Object.assign(params,{[options.path.size]:pagination.size,[options.path.page]:pagination.page})).then(res=>data=res)
	return [data,refresh]
}

const [data,refresh]=useTable(api,params)
refresh() // id=12
params.id = 10
refresh() // id=10
```
这样，我们就实现了 api 参数的传递，而且如果 params 的属性 id 是响应式的，还可以与页面结合，实现搜索功能！然而，使用同一个引用 params，可以解决传参问题，但是还是存在一些问题：
1、在 refresh 中，Object. assign 会给原来的对象 params 增加两个属性，要注意避免在 params 中与这两个属性发生冲突。
2、另外，我们可以看到这里的参数间存在了一种优先级，就是如果我们在 param 中也传入了分页参数，会在 refresh 中被 pagination 的分页参数覆盖调，pagination 的分页参数比 params 中的分页参数优先级更高，这样好吗？

第一个问题，在 refresh 中每次都会被 pagination 的属性覆盖，所以并不会出现什么问题，除非你在 params 上保存相同属性名的数据，这将被覆盖掉。
第二个问题和第一个问题本质是一样的，就是覆盖问题。根本原因就是都是引用同一个对象。
如果我们能够额外创建一个对象，就不会改变原来的对象，但是如何保持新创建对象能够动态变化呢？

### 方案二：试试 useTable 接受传入函数 params 如何？
兼容一下两种参数，让传入 useTable 的 api 参数既可以是函数，又可以是对象：
```javascript 
export function useTable<T>(
  api: (params: any) => Promise<T>,
  params?: object | (() => object),
  options?: {
    path?: { data?: keyPath; total?: keyPath; page?: string; size?: string }
    immediate?: boolean
  },
) {
  // 参数处理
  defaults(options, {
    path: { data: 'data', total: 'total', page: 'page', size: 'size' },
    immediate: false,
  })

  const [pagination, , , setTotal] = usePagination(() =>refresh())
  const loading = ref(false)
  const data = ref([])

  const refresh = (extraData?: object | (() => object)) => {
    const requestData = {
      [options?.path?.page as string]: pagination.current,
      [options?.path?.size as string]: pagination.size,
    }
    if (params) {
      if (typeof params === 'function') {
        Object.assign(requestData, params())
      } else {
        Object.assign(requestData, params)
      }
    }
    loading.value = true
    return api(requestData)
      .then((res) => {
        data.value = get(res, options!.path?.data, [])
        setTotal(get(res, options!.path?.total, 0))
        if (!has(res, options!.path?.data) || !has(res, options!.path?.total)) {
          console.warn('useTable：响应数据缺少所需字段')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  options!.immediate && refresh()

  return [data as T, refresh, loading, pagination]
}
```

这里代码主要新增了三处改变：

如果 params 是对象，直接使用，如果是函数，则读取其返回值。
优先级调整：paginaiton 的参数可以被 params 的同名属性覆盖，适用于开发者自己维护分页参数。
定义了返回值的类型。


最后，来让 refresh 函数也能接受我们的传参。
先看效果：

```js
<script>
...
// 这里接受item的id
const handleClick=(id:number)=>{
	refresh({id})
}
...
</script>
```

可以省去 params 和 paramsFn 的定义了！
实现代码：在定义 refresh 时允许加入参数。

```js
export function useTable<T>(
  api: (params: any) => Promise<T>,
  params?: object | (() => object),
  options?: {
    path?: { data?: keyPath; total?: keyPath; page?: string; size?: string }
    immediate?: boolean
  },
) {
  defaults(options, {
    path: { data: 'data', total: 'total', page: 'page', size: 'size' },
    immediate: false,
  })

  // 使用()=>fn()而不是fn()区别在于后者只是一个值且立即执行
  const [pagination, , , setTotal] = usePagination((extraData?: object) =>
    extraData ? refresh(extraData) : refresh(),
  )
  const loading = ref(false)
  const data = ref([])

  const refresh = (extraData?: object | (() => object)) => {
    const requestData = {
      [options?.path?.page as string]: pagination.current,
      [options?.path?.size as string]: pagination.size,
    }
    if (extraData) {
      if (typeof extraData === 'function') {
        Object.assign(requestData, extraData())
      } else {
        Object.assign(requestData, extraData)
      }
    }
    if (params) {
      if (typeof params === 'function') {
        Object.assign(requestData, params())
      } else {
        Object.assign(requestData, params)
      }
    }
    loading.value = true
    return api(requestData)
      .then((res) => {
        // TODO 检查响应状态码
        data.value = get(res, options!.path?.data, [])
        setTotal(get(res, options!.path?.total, 0))
        // 友好提示
        if (!has(res, options!.path?.data) || !has(res, options!.path?.total)) {
          console.warn('useTable：响应数据缺少所需字段')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

	return[data,refresh,paginaiton,loading]
}
```
需要注意的是，usePagination 处接受的回调函数也要适当修改。当然，pagination 也是要修改的了（增加回调函数有参数的情况，之前回调是没有参数的）。这里还额外新增了一个 reset 方法，用于重置分页器状态，这或许会有用！
```js
export function usePagination(
  cb: any,
  sizeOption: Array<number> = [10, 20, 50, 100, 200],
): any {
  const pagination = reactive({
    current: 1,
    total: 0,
    size: sizeOption[0],
    sizeOption,
    onPageChange: (page: number, extraData?: object) => {
      pagination.current = page
      return extraData ? cb(extraData) : cb()
    },
    onSizeChange: (size: number, extraData?: object) => {
      pagination.current = 1
      pagination.size = size
      return extraData ? cb(extraData) : cb()
    },
    setTotal: (total: number) => {
      pagination.total = total
    },
    reset() {
      pagination.current = 1
      pagination.total = 0
      pagination.size = pagination.sizeOption[0]
    },
  })

  return [
    pagination,
    pagination.onPageChange,
    pagination.onSizeChange,
    pagination.setTotal,
  ]
}
```
```html
  <!-- 分页器 -->
  <el-pagination
    v-model:current-page="current"
    :page-size="size"
    layout="total, prev, pager, next"
    :page-sizes="sizeOption"
    :total="total"
    @size-change="(size)=>handleSizeChange(size,params.id)"
    @current-change="(page)=>handleCurrentChange(page,params.id)"
  />
```
在此之前，需要保存 item.id 作为全局变量以供读取。
```js
const handleClick=(id:number)=>{
	params.id=id;
}
```

这样，我们就完成了一个功能相对完善的 Hook 函数。

