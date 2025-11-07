## 封装了一个关于布尔值的hook,通用性，比如：
boolean, loading， toggle开关切换，empty是否为空
```js
export default function useLoading(initValue = false) {
  const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(initValue);

  return {
    loading,
    startLoading,
    endLoading
  };
}
```

## 对于一个数组的常用操作封转成hook
```js
  const [newses, { push, remove, unshift, up, down, pop, shift, reverse, sort }] = useArray([
    { id: 1, content: t('page.home.projectNews.desc1'), time: '2021-05-28 22:22:22' },
    { id: 2, content: t('page.home.projectNews.desc2'), time: '2023-10-27 10:24:54' },
    { id: 3, content: t('page.home.projectNews.desc3'), time: '2021-10-31 22:43:12' },
    { id: 4, content: t('page.home.projectNews.desc4'), time: '2022-11-03 20:33:31' },
    { id: 5, content: t('page.home.projectNews.desc5'), time: '2021-11-07 22:45:32' }
  ]);
```
后续操作只需要：
```js
unshift({ id: 1, content: '我是第一个', time: '2021-11-07 22:45:32' })
push({ id: 6, content: '我是第六个', time: '2021-11-07 22:45:32' })
```
不需要再使用arr.value.push,arr.push 