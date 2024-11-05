

## 1、react父子组件的渲染顺序和更新顺序
- 初次渲染：
    父组件 render → 子组件 render → 子组件 useEffect → 父组件 useEffect
- 更新时（父组件状态变化时）：
    父组件 render → 子组件 render → 子组件旧 useEffect 清理 → 子组件新 useEffect → 父组件旧 useEffect 清理 → 父组件新 useEffect
- 卸载时：
    子组件的清理函数先执行，然后父组件的清理函数执行。

### 优化：
1、避免不必要的子组件更新：
- 使用 React.memo 缓存子组件，避免不必要的重新渲染。
- 使用 useCallback 和 useMemo 缓存回调函数和复杂计算结果。没有依赖，使用usePersistFn
1、StrictMode 导致的双调用：
在开发模式下，React 的 StrictMode 会导致组件的 useEffect 被调用两次。生产环境不会出现这个问题。

## 2、searchParams和PositionTree的问题- 1导致的问题
![alt text](./assets/image.png)
### 两种场景：
1、搜索条件FightModel和Version发生变化时，左侧PositionTree清空，且请求positionTree1的下拉选项
2、从下一页返回的，填充上次的 搜索条件和positionTree的选择，设置search条件的时候会触发到1的情况，导致positionTree只请求了1

### 解决：-useEffect中添加setTimeout，执行搜索和设置isFromNextPage值的回调
不加setTimeout:
![alt text](./assetsimage-1.png)
加setTimeout
![alt text](./assetsimage-2.png)
PositionTree组件：
![监听变化](./assetsimage-3.png)
父组件设置默认值：
![alt text](./assetsimage-4.png)
handleOnChange:
![alt text](./assetsimage-5.png)

1、useEffect 是异步执行的：
它不会阻塞渲染流程。即使在 useEffect 中注册了 setTimeout，也不会影响同步任务。
2、清理与重新注册的逻辑：
如果 useEffect 的依赖项发生变化，React 会先执行上一个 useEffect 的清理函数（如果有），然后再执行新的 useEffect。
3、setTimeout 回调会在事件循环的下一轮中执行：
即，只有当所有同步任务完成后，setTimeout 的回调才会被执行。这意味着，如果组件在 setTimeout 触发前卸载了，定时器的清理函数会防止回调执行。

### 解析：
控制台打印：
第一行：searchParams组件中useEffect中调用了change事件
第二行：PositionTree组件中useEffect中调用，此时isFromNextPage拿到的是true，从nextPage点击上一页来的（看PositionTree代码）
第三行：父组件useEffect,获取缓存中的选中的regionList
第四行：此时填充了positionTree,根据之前选中的项，获取对应的选择项
第五行：填充了searchParams,flightModel和version的监听（第一行）触发了handleOnChange事件
第六行：左（不加setTimeout)，因为第二行调用过了（设置了isFromNextPage为false），所以触发了情况1，清空了positionTree，并请求了positionTree1
         右（加setTimeout)，因为第二行调用过了,用setTimeout回调把设置false排在了后面，继续执行事件，执行完后再执行setTimeout回调

### 现有问题：
因isFromNextPage,监测到是2次，
一次在返回页面初始化时，搜索条件为{}；一次是设置默认的searchParams,监测到依赖值发生改变，
所以有2个setTimeOut回调，但不影响结果，可实现现有功能。

## 3、useHook
hook中返回的变量，如果是使用useState定义的，那么每次更新后，父组件中可以实时获取，不需要在父中用useEffect监听在设置另外的变量

## 4、 usePersistFn和callBack区别
### useCallback
```js
import { useCallback } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);  // 空数组依赖项，确保函数只在初次渲染时创建

  return <button onClick={handleClick}>Click me: {count}</button>;
};
```
特点：
- 依赖项敏感：useCallback 依赖于一个依赖项数组，当依赖项发生变化时，会重新创建新函数。
- 适用于子组件优化：传递给子组件的回调函数可以用 useCallback 缓存，避免不必要的子组件更新。

### usePersistFn
usePersistFn 是 ahooks 库中的一个 Hook，用于生成一个不会随组件重渲染而变化的函数引用。即使组件的状态或 props 改变，该函数的引用也不会变化。
```js
import { usePersistFn } from 'ahooks';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = usePersistFn(() => {
    setCount((prev) => prev + 1);
  });

  return <button onClick={handleClick}>Click me: {count}</button>;
};
```
特点：
- 永不变化的引用：无论组件重新渲染多少次，usePersistFn 返回的函数引用都不会变。(也无法获取到context)
- 适合事件监听器：在一些需要长时间绑定的事件回调中使用（如 addEventListener），即使组件重渲染，也能保证使用同一函数。

### 区别：
    特性        |	useCallback             |	usePersistFn
    提供方	    |   React 官方	             |  ahooks（第三方库）
依赖项敏感  |	依赖项变化时会重新生成函数引用	| 无需依赖项，引用永远不变
适用场景	|   子组件优化、依赖状态变化的回调	| 长期事件监听器、避免不必要的引用变化
重新创建函数的频率	| 依赖项变化时重新创建	    |  永不重新创建（除非组件卸载并重建）
性能优化    |  	避免子组件因函数引用变化而重新渲染	| 避免函数引用在多次渲染时频繁变化

使用场景选择：
- 如果你的函数依赖于某些状态，并且希望在状态变化时更新函数逻辑，使用 useCallback。
- 如果你需要保证函数的引用在整个生命周期中保持不变（例如事件监听器、跨多次渲染使用的回调），使用 usePersistFn。
