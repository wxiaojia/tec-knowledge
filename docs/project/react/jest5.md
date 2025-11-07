页面代码示例
假设以下代码跳转到一个名为 SelectRegionPage 的页面，并通过 state 参数传递数据：

MyPage.js
```jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();
  const currentView = "mapView";

  const handleNavigation = () => {
    navigate("/Neighbor-Search/selectRegion", { state: { view: currentView } });
  };

  return (
    <div>
      <h1>My Page</h1>
      <button onClick={handleNavigation}>Go to Select Region</button>
    </div>
  );
};

export default MyPage;
```
SelectRegionPage.js
```jsx
import React from "react";
import { useLocation } from "react-router-dom";

const SelectRegionPage = () => {
  const location = useLocation();
  const { view } = location.state || {};

  return (
    <div>
      <h1>Select Region Page</h1>
      <p>View Mode: {view}</p>
    </div>
  );
};

export default SelectRegionPage;
```
测试代码
1. 验证 navigate 的调用
我们需要 Mock useNavigate 并验证它是否以正确的参数调用：

测试代码：MyPage.test.js

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import MyPage from "./MyPage";

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("MyPage", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockImplementation(() => mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("navigates to selectRegion with correct state", () => {
    render(<MyPage />);

    // 点击按钮触发跳转
    fireEvent.click(screen.getByText("Go to Select Region"));

    // 验证 navigate 调用参数
    expect(mockNavigate).toHaveBeenCalledWith("/Neighbor-Search/selectRegion", {
      state: { view: "mapView" },
    });
  });
});
```
2. 验证目标页面接收 state 数据
在目标页面测试中，Mock useLocation，验证接收到的 state 数据是否正确：

测试代码：SelectRegionPage.test.js

javascript
复制代码
import React from "react";
import { render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import SelectRegionPage from "./SelectRegionPage";

// Mock useLocation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

describe("SelectRegionPage", () => {
  test("displays the passed state data", () => {
    useLocation.mockReturnValue({
      state: { view: "mapView" },
    });

    render(<SelectRegionPage />);

    // 验证页面是否正确显示 state 数据
    expect(screen.getByText("Select Region Page")).toBeInTheDocument();
    expect(screen.getByText("View Mode: mapView")).toBeInTheDocument();
  });

  test("handles missing state gracefully", () => {
    useLocation.mockReturnValue({
      state: null, // 模拟未传递 state 的情况
    });

    render(<SelectRegionPage />);

    expect(screen.getByText("View Mode:")).toBeInTheDocument(); // 检查空值处理
  });
});
3. 集成测试：完整跳转
如果需要测试完整的跳转逻辑，可以使用 MemoryRouter 模拟路由环境：

测试代码：MyPageIntegration.test.js

javascript
复制代码
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import MyPage from "./MyPage";
import SelectRegionPage from "./SelectRegionPage";

describe("Integration Test", () => {
  test("navigates from MyPage to SelectRegionPage with state", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<MyPage />} />
          <Route path="/Neighbor-Search/selectRegion" element={<SelectRegionPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 验证 MyPage 渲染
    expect(screen.getByText("My Page")).toBeInTheDocument();

    // 点击按钮跳转
    fireEvent.click(screen.getByText("Go to Select Region"));

    // 验证 SelectRegionPage 渲染
    expect(screen.getByText("Select Region Page")).toBeInTheDocument();
    expect(screen.getByText("View Mode: mapView")).toBeInTheDocument();
  });
});