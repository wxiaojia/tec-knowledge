页面代码示例
假设我们有一个简单的页面，包含以下功能：

渲染标题和输入框。
用户输入内容并点击按钮后，显示提交的结果。
从 API 获取初始数据并显示。
页面代码：

```jsx
复制代码
// src/pages/MyPage.js
import React, { useState, useEffect } from "react";

const MyPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");
  const [apiData, setApiData] = useState("");

  useEffect(() => {
    // 模拟 API 调用
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => setApiData(data.value))
      .catch(() => setApiData("Error loading data"));
  }, []);

  const handleSubmit = () => {
    setSubmittedValue(inputValue);
    setInputValue("");
  };

  return (
    <div>
      <h1>My Page</h1>
      <p>API Data: {apiData}</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {submittedValue && <p>Submitted Value: {submittedValue}</p>}
    </div>
  );
};

export default MyPage;
```

测试代码
以下是测试代码，验证页面的渲染、用户交互和 API 调用逻辑。

测试文件：MyPage.test.js

```jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyPage from "./MyPage";

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ value: "Mocked API Data" }),
  })
);

describe("MyPage", () => {
  beforeEach(() => {
    fetch.mockClear(); // 清除 fetch 的调用记录
  });

  test("renders the page correctly", () => {
    render(<MyPage />);
    expect(screen.getByText("My Page")).toBeInTheDocument();
    expect(screen.getByText("API Data:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  test("displays data fetched from API", async () => {
    render(<MyPage />);
    // 等待异步加载完成
    await waitFor(() => {
      expect(screen.getByText("API Data: Mocked API Data")).toBeInTheDocument();
    });
  });

  test("handles input and submit correctly", () => {
    render(<MyPage />);

    // 找到输入框并输入值
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Test Input" } });
    expect(input.value).toBe("Test Input");

    // 点击提交按钮
    const button = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(button);

    // 验证输入框清空和显示提交值
    expect(input.value).toBe("");
    expect(screen.getByText("Submitted Value: Test Input")).toBeInTheDocument();
  });

  test("displays error message on API failure", async () => {
    // Mock fetch 返回错误
    fetch.mockImplementationOnce(() => Promise.reject("API is down"));

    render(<MyPage />);

    // 等待错误信息显示
    await waitFor(() => {
      expect(screen.getByText("API Data: Error loading data")).toBeInTheDocument();
    });
  });
});
```

测试代码解析
## 页面渲染测试：
```javascript
test("renders the page correctly", () => {
  render(<MyPage />);
  expect(screen.getByText("My Page")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});
```
验证页面的静态内容（标题、按钮等）是否正确渲染。

## API 数据加载测试：

```javascript
test("displays data fetched from API", async () => {
    render(<MyPage />);
    await waitFor(() => {
        expect(screen.getByText("API Data: Mocked API Data")).toBeInTheDocument();
    });
});
```
Mock fetch 返回的数据，验证页面是否正确显示从 API 获取的内容。

## 用户交互测试：

```javascript
test("handles input and submit correctly", () => {
  render(<MyPage />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "Test Input" } });
  expect(input.value).toBe("Test Input");
  const button = screen.getByRole("button", { name: "Submit" });
  fireEvent.click(button);
  expect(screen.getByText("Submitted Value: Test Input")).toBeInTheDocument();
});
```
模拟用户输入和点击行为，验证表单逻辑是否正确。

## API 错误处理测试：

```javascript
test("displays error message on API failure", async () => {
  fetch.mockImplementationOnce(() => Promise.reject("API is down"));
  render(<MyPage />);
  await waitFor(() => {
    expect(screen.getByText("API Data: Error loading data")).toBeInTheDocument();
  });
});
```
Mock API 错误响应，验证页面是否正确显示错误消息。