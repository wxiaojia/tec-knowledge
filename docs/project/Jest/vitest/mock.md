
pyOn同jest.fn类似，也是返回一个mock的方法，同时也支持object[methodName]这样的mock函数。或者当我们想覆盖一些默认的方法或者行为的时候，spyOn是一个非常不错的选择

## mock获取一个值
```js
import { render } from "@testing-library/react";
import TodoSpy from "../todo-spy";

describe("测试TodoSpy组件", () => {
  it("正确渲染pathname", () => {
    const pathname = "/test/eason";
    const spy = jest.spyOn(window, "location", "get").mockReturnValueOnce({     // mock了一次返回值的，因为我们这里只是用到了值而没有修改到什么值，所以第三个参数只需要get就可以，
      ...window.location,
      pathname,         // 指定了一个pathname，这样就可以保证页面中获取到的pathname是我们指定的这个，
    });
    const { queryByText } = render(<TodoSpy />);
    const element = queryByText(pathname);
    expect(element).not.toBeNull();
    spy.mockRestore();      // 清除副作用，达到重置的效果
  });
});
```

## mock一些方法
```js
export default function TodoSpy() {
  const { pathname } = window.location;
  const list = document.querySelectorAll("img");
  return (
    <div>
      <span key="pathname">{pathname}</span>
      <span key="result">{`size: ${list.length}`}</span>
    </div>
  );
}
```
测：
```js
it("正确渲染querySelectorAll的结果", () => {
    const list = [1, 2, 3];
    const spy = jest
      .spyOn(document, "querySelectorAll")
      .mockImplementationOnce((_str: string) => list);
      
    const { queryByText } = render(<TodoSpy />);
    const element = queryByText(`size: ${list.length}`);
    expect(element).not.toBeNull();
    spy.mockRestore();
  });
```

