## 一、获取store数据
源码:
```js
const data = useAppSelector((state: any) => state.region.data);
```

### 测试
```js
  beforeEach(() => {
    // Mock useAppSelector to return region data
    // mock store数据
    (useAppSelector as vi.mock).mockImplementation((selector) =>
      selector({
        region: {
          data: {
            "Top View": { path: "top-view-path" },
            "Bottom View": { path: "bottom-view-path" },
            "Cabin View": { path: "cabin-view-path" },
          },
        },
      })
    );

    // Mock useAppDispatch
    (useAppDispatch as vi.mock).mockReturnValue(vi.fn());
  });
```

## 二、点击跳转
```js
let navigate = useNavigate();
navigate('/Neighbor-Search/selectRegion', { state: {view: currentView}})


// 测试：
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
// 点击操作
expect(mockNavigate).toHaveBeenCalledWith("/Neighbor-Search/selectRegion", {
    state: { view: "Top View" },
});

```

## 三、用provider的 
```js
const region = useAppSelector((state: any) => state.region.data);

// 测试：
const mockStore = configureStore({
    reducer: {
        neighborSearch: neighborSearchReducer,
        region: regionReducer,
      },
      preloadedState: {
        region: {
            data: {
              "Top View": { path: "path/to/top-view-image.jpg" },
            //   "Side View": { path: "path/to/side-view-image.jpg" },
            },
          },
          neighborSearch: {
            clickArea: "",
          },
      },
});

 <Provider store={mockStore}>
    <ViewContent view="Top View" searchParams={{}} setView={vi.fn()} />
  </Provider>

```


## 四、组件内调用自定义Hook/请求,且返回内容
```js
    const {
      level1Options,
      level2Options,
      level3Options,
      level4Options,
      getData,
      getOptionsByPt,
      clearOptions,
    } = usePositionTreeTitles();

// 测试：
vi.mock("../hooks/usePositionTreeTitles", () => ({
    usePositionTreeTitles: vi.fn(),
  }));
 beforeEach(() => {
    // 为 usePositionTreeTitles 提供 Mock 返回值
    (usePositionTreeTitles as jest.Mock).mockReturnValue({
      level1Options: [{ label: "Option 1", value: "1" }],
      level2Options: [{ label: "Option 2", value: "2" }],
      level3Options: [],
      level4Options: [],
      getData: vi.fn(),
      getOptionsByPt: vi.fn(),
      clearOptions: vi.fn(),
    });
  });

 (usePositionTreeTitles as vi.Mock).mockImplementation(() => ({
        level1Options: ['option1'],
        level2Options: ['option2'],
        level3Options: ['option3'],
        level4Options: [
          { label: "Option 1", value: "1" },
          { label: "Option 2", value: "2" },
          { label: "Option 3", value: "3" },
        ],
        getData: vi.fn(),
        getOptionsByPt: vi.fn(),
        clearOptions: vi.fn(),
      }));
```

mockReturnValue ：具体返回值； mockImplementation： 模拟具体的实现逻辑
- 使用 mockReturnValue 的场景
函数行为简单，始终返回同一个值。
不关心输入参数。

- 使用 mockImplementation 的场景
函数的返回值依赖于输入参数。
函数需要执行某些逻辑（例如，调用其他函数、修改状态）。
模拟复杂的函数行为。
