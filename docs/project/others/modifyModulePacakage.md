## 面试官：如果一个NPM包部分功能不满足需求，如何修改其部分功能~

### 1、fork
fork源码到自己的项目，去源码中修改
如果不希望公开，搭建自己的npm私有包，将项目的包切到自己发布的包上。

### 2、提交PR
如果觉得对其他用户有用，可以提交PR，
如果被接受合并，就可以直接用未来版本的依赖包，不需要自己维护fork


### 3、本地修改与补丁
1、在本地对包进行修改：直接在项目的 node_modules 目录下找到并修改对应的第三方包文件。虽然这种修改是临时的，但是接下来的步骤会帮助我们保存这些改动。

2、创建补丁文件：一旦完成了必要的修改，你可以使用 git diff 或其他差异比较工具来生成一个补丁文件。这个文件记录了修改的内容。如果你的项目使用 Git 进行版本控制，可以先提交所有其他更改，以便 git diff 只显示对第三方包的修改。

git diff > patches/third-party-package.patch

3、应用补丁：为了自动化地在每次安装依赖时应用这个补丁，你可以使用如 patch-package 这样的工具。patch-package 允许在 node_modules 中的包上应用补丁，并且这些补丁可以和你的项目代码一起被版本控制。

安装patch-package:
```js
npm install patch-package postinstall-postinstall --save-dev
```
然后，将应用补丁的步骤添加到 package.json 中的 scripts 字段：
```js
"scripts": {
  "postinstall": "patch-package"
}
```

这样，每次运行 npm install 时，postinstall 脚本都会执行，自动应用保存在 patches/目录下的所有补丁。

假设我们要要修改 axios 包，那么我们可以直接在项目的 node_modules/axios 目录下对 axios 进行必要的修改。这些修改可以是任何东西，从简单的配置更改到函数逻辑的更新。

### 生成补丁
使用 patch-package 生成一个补丁文件。这个命令会比较你对 node_modules 中 axios 的修改，并将这些修改保存为一个补丁文件。

```js
npx patch-package axios
```
执行这个命令后，patch-package 会在项目的根目录下创建一个 patches 目录（如果还没有的话），并在里面生成一个名为 axios+版本号.patch 的文件，其中版本号是你项目中使用的 axios 的版本。

为了验证补丁是否会被正确应用，你可以尝试删除 node_modules 目录并重新安装依赖：
```js
rm -rf node_modules
npm install
```
在 npm install 执行完成后，patch-package 会自动运行并应用你之前创建的补丁，将你对 axios 的修改重新应用到新安装的 axios 包上。

这样，你就完成了对 axios 的修改，以及配置项目自动应用这些修改的整个流程。


### 包装第三方包（像一个插件一样）
包装第三方包方法涉及创建一个新的模块（或包），专门用来封装第三方包。通过这种方式，你可以在不直接修改原始包的情况下，添加新的功能、修改现有方法或者调整方法的行为。

创建一个新的文件（如 third-party-wrapper.js），在这个文件中导入第三方包，并实现需要修改或扩展的功能。
```js

// third-party-wrapper.js
import { foo } from "axios";

// 修改或扩展someFunction的行为
export function enhancedSomeFunction() {
  // 在调用原始函数之前执行一些操作
  console.log("你好");

  // 调用原始函数
  let result = foo.apply(this, arguments);

  // 在调用原始函数之后执行一些操作
  console.log("小黑子");

  // 返回结果
  return result;
}
```
在项目中的其他部分，你可以直接引入并使用这个封装模块，而不是直接使用第三方包。这样，你就可以利用修改后的功能，同时避免了对第三方包的直接修改。
```js
import { enhancedSomeFunction } from "./third-party-wrapper";

enhancedSomeFunction();
```
这种方法的好处是，它提供了一个清晰的隔离层，使得第三方包的任何更新不会直接影响到你对功能的定制。同时，这也使得维护和升级第三方包变得更加容易，因为你只需要在封装层中做出相应的调整。