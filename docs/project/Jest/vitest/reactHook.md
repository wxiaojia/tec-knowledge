## 自定义的hook:
需要这个包：@testing-library/react-hooks

```js
import useQueryCheckbox from '../useCheckbox';
import { renderHook } from '@testing-library/react-hooks';

interface MockCheckboxItemProps {
  key: string;
  value: string;
}

// 获取用于测试的默认checkbox对象列表
function generateCheckboxList(endIndx: number, startIndex = 1) {
  const defaultCheckboxList: MockCheckboxItemProps[] = [];
  for (let i = startIndex; i <= endIndx; i++) {
    defaultCheckboxList.push({
      key: `${i}`,
      value: `mock-${i}`,
    });
  }
  return defaultCheckboxList;
}

describe('hook useQueryCheckbox', () => {
  it('should return the total selected item', () => {
    const checkboxList = generateCheckboxList(8);
    const { result } = renderHook(() => useQueryCheckbox(checkboxList, 'key'));
    const { selected } = result.current;
    expect(selected).toEqual([]);
  });

  it('should return the total default selected item', () => {
    const checkboxList = generateCheckboxList(8);
    const { result } = renderHook(() =>
      useQueryCheckbox(checkboxList, 'key', checkboxList),
    );
    const { selected } = result.current;
    expect(selected).toEqual(checkboxList);
  });
});

```

## 进阶：renderHook的参数

### initialProps
```js
import { renderHook } from "@testing-library/react-hooks";
import { useCounter, UseCounterProp } from "../useCounter";


describe('hook useCounter', () => {
    it('should return init Value', () => {
        const initialProps: UseCounterProp = {
            initCount: 9
        };
        const { result } = renderHook(props => useCounter(props), {
            initialProps
        });
        expect(result.current.count).toBe(initialProps.initCount);
    });
});
```

### wrapper
这个主要是给我们的Hook提供一个包裹的React组件，
例如我们的Hook依赖的context，除了可以用mock的方式来处理这些context依赖之外，还可以考虑用wrapper来提供搞一个类似的context组件，达到模拟上下文的作用。

```js
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";

descript('xxxx', () => {
    it('should call addWithBase function as expect', () => {
        const baseNum = 10;
        const wrapper: WrapperComponent<{
            children: any;
          }> = ({ children }) => <CounterContext.Provider value={{ baseNum, setBaseNum: () => {} }}>{children}</CounterContext.Provider>;

        const { result } = renderHook(() => useCounter({}), {
            wrapper
        });
        act(() => {
            result.current.addWithBase(1)
        });
        expect(result.current.count).toBe(baseNum);
    });
});
```
### renderHook result
上面提到的result.current
### rerender
```js
export function useCounter({ initCount = 0 }: UseCounterProp) {
    ...
     useEffect(() => {
        setCount(initCount ?? 0);
    }, [initCount]);
    ...

}
```
测:
根据initCount这个prop来执行一些逻辑，就是对prop的变更有依赖，我们需要针对这个逻辑写一个case
```js
it('test rerender useCounter hook', () => {
    const initialProps: UseCounterProp = {
        initCount: 9
    };
    const { result, rerender } = renderHook(props => useCounter(props), {
        initialProps
    });
    expect(result.current.count).toBe(initialProps.initCount);
    rerender({ initCount: 10 });
    expect(result.current.count).toBe(10);
});
```
还是和之前的case差不多，只不过这一次我们用上了rerender，我们传入了一个新的prop，然后断言一下新的值是否符合预期

### unmount
这个方法是在测试一些卸载组件之后的事件，比如我们在react中会在组件销毁的时候清除一些副作用或者做一些请求之类的，这个unmount就是用在这种情况;
清除副作用
```js
import { useContext, useEffect, useState } from "react";
import { CounterContext } from "../context/counter-context";

export interface UseCounterProp {
    initCount?: number;
    onDestroy?: () => void;
}

export function useCounter({ initCount = 0, onDestroy }: UseCounterProp) {
    const [count, setCount] = useState(initCount);
    const { baseNum } = useContext(CounterContext);

    useEffect(() => {
        setCount(initCount ?? 0);
        return () => onDestroy?.();
    }, [initCount, onDestroy]);

    function add(value: number) {
        setCount(count + value);
    }

    function addWithBase(value: number) {
        setCount(count + baseNum * value);
    }

    function minus(value: number) {
        setCount(count - value);
    }

    return {
        count,
        add,
        minus,
        addWithBase,
    };
}
```
```js
it('test umount function', () => {
    const onDestroy = jest.fn();
    const initialProps: UseCounterProp = {
        onDestroy,
    };
    const { unmount } = renderHook(() => useCounter(initialProps));
    unmount();
    expect(onDestroy).toBeCalledTimes(1);
});
```

### waitForNextUpdate
返回一个下一次Hook重新渲染的promise方法，通常用于异步结果更新state的场景

我们增加一个异步的方法，用来更新数据，看下我们的改造后完整的hook
```js
import { useContext, useEffect, useState } from "react";
import { CounterContext } from "../context/counter-context";

export interface UseCounterProp {
    initCount?: number;
    onDestroy?: () => void;
    // 是否通过请求初始化数据
    initUpdateByRequest?: boolean;
}

const mockRequest = function() {
    return new Promise<number>(resolve => {
        setTimeout(() => {
            resolve(5);
        }, 500);
    })
};

export function useCounter({ initCount = 0, onDestroy, initUpdateByRequest }: UseCounterProp) {
    const [count, setCount] = useState(initCount);
    const { baseNum } = useContext(CounterContext);

    useEffect(() => {
        setCount(initCount ?? 0);
        return () => onDestroy?.();
    }, [initCount, onDestroy]);

    useEffect(() => {
        if (initUpdateByRequest) {
            initByRequest();
        }
    }, [initUpdateByRequest]);

    async function initByRequest() {
        const value = await mockRequest();
        setCount(value);
    }

    function add(value: number) {
        setCount(count + value);
    }

    function addWithBase(value: number) {
        setCount(count + baseNum * value);
    }

    function minus(value: number) {
        setCount(count - value);
    }

    return {
        count,
        add,
        minus,
        addWithBase,
    };
}```

主要改动是增加了一个initUpdateByRequest参数，如果是true的话我们就执行一个异步函数，500ms之后返回数据然后更新state
我们来写对应的case
```js
it('test wait for next update', async () => {
    const initialProps: UseCounterProp = {
        initUpdateByRequest: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useCounter(initialProps));
    expect(result.current.count).toBe(0);
    await waitForNextUpdate();
    expect(result.current.count).toBe(5);
});

```

### waitForValueToChange
```js
  async function initByRequest() {
        const value = await mockRequest();
        setCount(value);
        setFinishInitReqUpdate(true);
    }
```

```js
it('test wait for value to change', async () => {
    const initialProps: UseCounterProp = {
        initUpdateByRequest: true,
    };
    const { result, waitForValueToChange } = renderHook(() => useCounter(initialProps));
    expect(result.current.count).toBe(0);
    await waitForValueToChange(() => result.current.finishInitReqUpdate, {
        timeout: 1500
    });
    expect(result.current.count).toBe(5);
});
```