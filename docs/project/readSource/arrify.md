## 将值转化为数组
```js
export default function arrify(value) {
	if (value === null || value === undefined) {
		return [];
	}

	if (Array.isArray(value)) {
		return value;
	}

	if (typeof value === 'string') {
		return [value];
	}

	if (typeof value[Symbol.iterator] === 'function') {
		return [...value];
	}

	return [value];
}

```

- 特殊情况null/undefined返回空数组
- Symbol.iterator是 JavaScript 中一个内置的符号，用于定义一个对象的默认迭代器。
- 常见可迭代对象有：Array, Map, Set, String 对象等。
- typeof value[Symbol.iterator] === 'function' 检查是否为可迭代对象，是才能用...展开，成数组


### iterator示例
```js
// 示例 1: 数组
const arrayValue = [1, 2, 3];
console.log((typeof arrayValue[Symbol.iterator] === 'function') ? [...arrayValue] : null);
// 输出: [1, 2, 3]

// 示例 2: 字符串
const stringValue = "hello";
console.log((typeof stringValue[Symbol.iterator] === 'function') ? [...stringValue] : null);
// 输出: ['h', 'e', 'l', 'l', 'o']

// 示例 3: Set
const setValue = new Set([1, 2, 3]);
console.log((typeof setValue[Symbol.iterator] === 'function') ? [...setValue] : null);
// 输出: [1, 2, 3]

// 示例 4: 对象 (不可迭代)
const objectValue = { a: 1, b: 2 };
console.log((typeof objectValue[Symbol.iterator] === 'function') ? [...objectValue] : null);
// 输出: null
```
