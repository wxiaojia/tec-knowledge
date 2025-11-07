## 单元测试（测试页面显示）
## 表单测试
## 异步操作测试
## 导航功能测试

# 2. 页面测试方案
为每个页面编写单元测试、集成测试，以及关键逻辑的覆盖。

## 2.1 单元测试（Component-Level）
确保每个组件的功能和交互行为得以测试。

示例：测试 HomePage 页面

```jsx
// HomePage.test.js
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

test('renders homepage heading', () => {
  render(<HomePage />);
  const headingElement = screen.getByText(/Welcome to Home/i);
  expect(headingElement).toBeInTheDocument();
});

test('shows recommended content', () => {
  render(<HomePage />);
  const recommendation = screen.getByText(/Recommended for you/i);
  expect(recommendation).toBeInTheDocument();
});

```
## 2.2 表单测试（Contact Page）
重点覆盖输入框、验证逻辑和提交行为。

示例：测试 ContactPage 页面

```jsx
// ContactPage.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ContactPage from './ContactPage';

test('renders contact form', () => {
  render(<ContactPage />);
  const nameInput = screen.getByLabelText(/Name/i);
  const emailInput = screen.getByLabelText(/Email/i);
  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
});

test('validates email on submit', () => {
  render(<ContactPage />);
  const emailInput = screen.getByLabelText(/Email/i);
  const submitButton = screen.getByText(/Submit/i);

  fireEvent.change(emailInput, { target: { value: "invalid-email" } });
  fireEvent.click(submitButton);

  const errorMessage = screen.getByText(/Invalid email address/i);
  expect(errorMessage).toBeInTheDocument();
});
```

## 2.3 异步操作测试（Settings Page）
覆盖数据获取或 API 调用。

示例：测试异步数据加载

```jsx
// SettingsPage.test.js
import { render, screen, waitFor } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import mockApi from './api';

jest.mock('./api');

test('loads and displays settings data', async () => {
  mockApi.getSettings.mockResolvedValue({ theme: "dark" });

  render(<SettingsPage />);
  const loadingIndicator = screen.getByText(/Loading settings/i);
  expect(loadingIndicator).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument());
});
```

# 3. 测试导航功能
为导航组件编写交互测试，确保导航正确渲染和跳转。

示例：导航功能

```jsx
// Navbar.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

test('renders navigation links', () => {
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  const homeLink = screen.getByText(/Home/i);
  const aboutLink = screen.getByText(/About/i);
  const contactLink = screen.getByText(/Contact/i);

  expect(homeLink).toBeInTheDocument();
  expect(aboutLink).toBeInTheDocument();
  expect(contactLink).toBeInTheDocument();
});
```