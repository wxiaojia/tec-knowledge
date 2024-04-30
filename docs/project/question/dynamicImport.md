## import es6 的动态导入

ES6 动态导入是指在运行时根据条件或需要动态地导入模块。它允许你延迟加载模块，仅在需要时再加载它们，这在某些情况下可以提高性能并减少初始加载时间。动态导入使用 import() 函数来实现。

以下是 ES6 动态导入的基本语法和用法：

```js
import(modulePath)
  .then(module => {
    // 使用导入的模块
  })
  .catch(error => {
    // 处理导入错误
  });
  ```
import() 函数接收一个字符串参数 modulePath，表示要动态导入的模块路径。这个路径可以是相对路径或绝对路径，也可以是一个包含变量的表达式，只要在运行时能够确定模块路径即可。
import() 函数返回一个 Promise，当模块成功加载时，Promise 将被解析为一个包含导入的模块的对象。你可以在 then() 方法中使用这个模块。
如果加载模块失败（例如模块路径无效或网络请求失败），Promise 将被拒绝，并进入 catch() 方法中进行错误处理。
以下是一个示例，演示了如何在 ES6 中动态导入模块：

```js
const modulePath = './myModule.js';

import(modulePath)
  .then(module => {
    // 使用导入的模块
    module.default(); // 假设 myModule.js 导出了一个默认的函数
  })
  .catch(error => {
    // 处理导入错误
    console.error('Error:', error);
  });
  ```
在上面的示例中，myModule.js 是要动态导入的模块，module.default() 调用了这个模块的默认导出（假设模块导出了一个默认的函数）。如果加载模块失败，错误将被捕获并在控制台中输出。

动态导入使得在某些情况下能够更灵活地加载模块，例如根据用户行为或其他条件来决定加载哪些模块，或者在一些异步操作完成后再加载模块等。


## commonjs 转为es6动态导入
```js
let apply = (action, options) => {
    console.log('apply参数', action);
    require(`./commander/${action}`)(options);
  
};
```
转为es6动态导入:
```js
let apply = async (action, options) => {
  console.log('apply参数', action);

  try {
    // 使用动态导入来导入模块
    const module = await import(`./commander/${action}`);
    // 调用导入的模块的函数
    module.default(options);
  } catch (error) {
    console.error('导入模块时出错:', error);
  }
};
```
在这个修改后的版本中，我们使用 import() 函数来动态导入模块，并使用 await 关键字等待 Promise 解析。然后，我们调用导入的模块的默认导出（假设模块导出了一个默认的函数），并将选项作为参数传递给它。

!!! **动态导入返回的是一个 Promise，必须使用 await 来等待 Promise 解析**。如果加载模块失败，错误将被捕获并在控制台中输出。
