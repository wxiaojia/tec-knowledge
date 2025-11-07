## store的测试代码

在使用 @reduxjs/toolkit 的项目中，测试 Redux store 的逻辑主要涉及以下方面：

- Action 测试：验证 actions 是否返回正确的 payload。
- Reducer 测试：验证 reducer 在不同的 actions 下是否能返回预期的 state。
- Thunk 测试（异步逻辑）：测试异步逻辑的 dispatch 和效果。
- Store 集成测试：验证完整的 store 是否能够正常工作。

## 1. 示例 Redux Store 配置
假设我们有一个简单的 Redux slice，管理计数器的逻辑：

```javascript
// src/features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```
## 2. 测试 Action
验证 actions 是否返回正确的类型和 payload。

```javascript
复制代码
// src/features/counter/counterSlice.test.js
import { increment, decrement, incrementByAmount } from './counterSlice';

test('should create an increment action', () => {
  expect(increment()).toEqual({ type: 'counter/increment' });
});

test('should create a decrement action', () => {
  expect(decrement()).toEqual({ type: 'counter/decrement' });
});

test('should create an incrementByAmount action with payload', () => {
  expect(incrementByAmount(5)).toEqual({
    type: 'counter/incrementByAmount',
    payload: 5,
  });
});
```
## 3. 测试 Reducer
直接测试 reducer，验证不同 action 下 state 的变化。

```javascript
复制代码
import counterReducer, { increment, decrement, incrementByAmount } from './counterSlice';

describe('counter reducer', () => {
  const initialState = { value: 0 };

  test('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual({ value: 0 });
  });

  test('should handle increment', () => {
    const actual = counterReducer(initialState, increment());
    expect(actual.value).toEqual(1);
  });

  test('should handle decrement', () => {
    const actual = counterReducer({ value: 1 }, decrement());
    expect(actual.value).toEqual(0);
  });

  test('should handle incrementByAmount', () => {
    const actual = counterReducer(initialState, incrementByAmount(5));
    expect(actual.value).toEqual(5);
  });
});
```
## 4. 测试 Thunks
对于异步逻辑（Thunk），可以使用 jest.mock 和 redux-mock-store 来测试。

示例 Thunk
```javascript
复制代码
// src/features/counter/counterThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCounterValue = createAsyncThunk('counter/fetchValue', async () => {
  const response = await fetch('/api/counter');
  const data = await response.json();
  return data.value;
});
```
Thunk 测试
```javascript
复制代码
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchCounterValue } from './counterThunk';

const mockStore = configureMockStore([thunk]);

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ value: 42 }),
  })
);

describe('counter thunk', () => {
  test('should dispatch fulfilled action with fetched data', async () => {
    const store = mockStore({ counter: { value: 0 } });

    await store.dispatch(fetchCounterValue());

    const actions = store.getActions();
    expect(actions[0].type).toEqual('counter/fetchValue/pending');
    expect(actions[1].type).toEqual('counter/fetchValue/fulfilled');
    expect(actions[1].payload).toEqual(42);
  });
});
```

## 5. 测试 Store 集成
测试完整的 store 配置，验证 reducers 和 actions 的集成效果。

完整 Store 示例
```javascript
复制代码
// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```
Store 集成测试
```javascript
复制代码
import { store } from './store';
import { increment, decrement, incrementByAmount } from '../features/counter/counterSlice';

test('should handle actions through store', () => {
  store.dispatch(increment());
  expect(store.getState().counter.value).toEqual(1);

  store.dispatch(incrementByAmount(5));
  expect(store.getState().counter.value).toEqual(6);

  store.dispatch(decrement());
  expect(store.getState().counter.value).toEqual(5);
});
```