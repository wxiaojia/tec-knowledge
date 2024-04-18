## 目录是否存在
### 同步 fs.existsSync()
```js
const fs = require('fs');

// directory to check if exists
const dir = './uploads';

// check if directory exists
if (fs.existsSync(dir)) {
    console.log('Directory exists!');
} else {
    console.log('Directory not found.');
}
```
如果路径存在，则existSync()方法返回true，否则返回false。


### 异步：fs.access() 
此方法将路径作为输入并测试用户的权限。
```js
const fs = require('fs');

// directory to check if exists
const dir = './uploads';

// check if directory exists
fs.access(dir, (err) => {
    console.log(`Directory ${err ? 'does not exist' : 'exists'}`);
});
```


## 文件是否存在