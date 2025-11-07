## 测试分组 describe
## beforeEach 和 afterEach
## 参数化测试
## mock函数：监控函数调用或替代实际实现
## mock模块：调用API
## 清理mock clearAllMocks

# 1. 基础配置优化
1.1 初始化 Jest
确保安装并初始化 Jest：

bash
复制代码
npm install --save-dev jest
npx jest --init
配置文件（jest.config.js）中设置适合的选项：

javascript
复制代码
module.exports = {
  testEnvironment: 'node', // 或 'jsdom'，根据运行环境选择
  collectCoverage: true, // 启用覆盖率统计
  coverageDirectory: 'coverage', // 覆盖率报告输出目录
  testPathIgnorePatterns: ['/node_modules/'], // 忽略测试路径
  verbose: true, // 显示详细测试日志
};
1.2 使用 package.json 中的脚本
添加便捷的测试脚本：

json
复制代码
"scripts": {
  "test": "jest --watch", // 启用实时监控模式
  "test:coverage": "jest --coverage" // 生成覆盖率报告
}
运行时：

bash
复制代码
npm run test
npm run test:coverage
# 2. 测试用例高效编写
## 2.1 使用测试分组
通过 describe 将测试用例逻辑分组，便于组织和调试：

```javascript
describe('Math Operations', () => {
  test('adds numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('subtracts numbers correctly', () => {
    expect(5 - 3).toBe(2);
  });
});
```
## 2.2 使用 beforeEach 和 afterEach
在测试前后进行资源初始化和清理：

```javascript
复制代码
let counter;

beforeEach(() => {
  counter = 0;
});

afterEach(() => {
  counter = null;
});

test('increments counter', () => {
  counter++;
  expect(counter).toBe(1);
});
```

## 2.3 参数化测试
避免重复代码，通过 test.each 编写参数化测试：

```javascript
复制代码
test.each([
  [1, 1, 2],
  [2, 3, 5],
  [3, 5, 8],
])('adds %i and %i to get %i', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
```

# 3. Mock 功能高效使用
## 3.1 Mock 函数
Mock 函数可以监控函数调用或替代实际实现：
```javascript
const mockFn = jest.fn();

mockFn('Hello');
mockFn('World');

expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('Hello');
```
## 3.2 Mock 模块
通过 jest.mock 替代实际模块实现：

```javascript
jest.mock('./api', () => ({
  fetchData: jest.fn(() => Promise.resolve('Mocked Data')),
}));

const { fetchData } = require('./api');

test('fetches mocked data', async () => {
  const data = await fetchData();
  expect(data).toBe('Mocked Data');
});
```

## 3.3 清理 Mock
在每次测试后重置 Mock 状态：
```javascript
复制代码
afterEach(() => {
jest.clearAllMocks(); // 清除调用记录
});
```

# 4. 性能优化
## 4.1 启用监控模式
在大型项目中启用 --watch 只运行受修改文件影响的测试：
```bash
npx jest --watch
```

## 4.2 使用快照测试
对于 UI 或返回结果一致的场景，使用快照快速验证：

```javascript
test('matches the snapshot', () => {
  const obj = { name: 'Jest', version: '29.0' };
  expect(obj).toMatchSnapshot();
});
```
## 4.3 跳过特定测试
在调试中跳过或只运行部分测试：

```javascript
test.skip('this test is skipped', () => {
  expect(true).toBe(false);
});

test.only('only this test runs', () => {
  expect(true).toBe(true);
});
```

5. 覆盖率统计和报告
5.1 启用覆盖率
在 jest.config.js 中启用覆盖率统计：

javascript
复制代码
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'], // 只统计 src 目录
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
运行覆盖率统计：

bash
复制代码
npx jest --coverage
5.2 生成报告
查看 coverage/ 中生成的 HTML 覆盖率报告，打开 index.html。

6. Debug 和日志
6.1 使用 console.log
可以直接在测试中使用 console.log 打印调试信息。

6.2 配合 VS Code 调试
创建 .vscode/launch.json：
json
复制代码
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
在 VS Code 中按 F5 启动调试。
7. 与 CI/CD 集成
7.1 GitHub Actions
在 .github/workflows/test.yml 中配置：

yaml
复制代码
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run Jest
        run: npm test
7.2 提交覆盖率报告
使用工具如 Codecov 上传覆盖率报告：

bash
复制代码
npx jest --coverage
bash <(curl -s https://codecov.io/bash)
8. 常见问题和解决方案
8.1 异步测试超时
确保为异步测试提供超时时间：

javascript
复制代码
test('async test', async () => {
  await expect(fetchData()).resolves.toBe('data');
}, 10000); // 设置超时时间为 10 秒
8.2 Mock 模块不起作用
确保模块在测试文件顶部被 jest.mock。
如果 Mock 不生效，尝试 jest.resetModules() 重置模块缓存。