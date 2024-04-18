问题:
- 搭建一个脚手架的工程 1
- 命令参数模块 3
- 用户交互模块 4
- 文件拷贝模块 5
- 动态文件生成模块 6
- 自动安装依赖模块 7
- 怎么拉取git/bitbucket 文件代码

## 1. 搭建一个monorepo 风格的脚手架工程
1. polarise-cli 
-  最外层工程 没有任何依赖
2.  packages/polarizon-cli 
-  package 添加bin,
```js
 "bin": {
    "gendo": "./bin/index.js"
  },
  ```
-  脚手架node的一些操作，安装commander\inquirer等依赖
3. example/app
- 安装依赖 package/gendo-cli的包名 name："gendo-cli": "workspace:*",
- script跑的时候添加 gendo，bin定的名字
测试gendo命令需要在example目录中及进行

## 2. npm link,为什么使用 monorepo 而不是用npm link
- 如果在本地有多个版本的脚手架仓库，在仓库A中修改代码后，运行 gendo 命令后，发现更改的代码不生效。
- 原因：因为已经在仓库B的脚手架工程中运行 npm link，导致我们在运行 gendo 命令后是执行仓库B中的代码
- 解决：要先在仓库B的脚手架工程中运行 npm unlink 后，然后在仓库A中的脚手架工程中运行 npm link 后，修改仓库A中的代码才能生效。

使用monorepo多包工程，就不需要去执行npm link。且example可以引用本地开发的脚手架，实现脚手架工程的本地调试，不需要依赖npm

## 3. yargs/commander解析命令参数
## 4. inquirer 开源库来实现询问式的交互
## 5. copy-dir 拷贝文件
## 6. 模板根据需求生成代码， mustache
## 7. 自动安装依赖模块 Node
## 8. 怎么拉取git/bitbucket 文件代码
前提：git/bitbucket 已ssh设置
```js
const gitUrl = 'ssh://git@git.polarizon.com:8022/rdi/cypridina.git' // 模板地址
program
  .command('init [name]')
  .description('初始化项目 ')
  .action((name) => {
    try {
        // 是否已存在目录
        execSync(`git clone ${gitUrl} ${name}`);
        console.info('下载成功');
        // 修改name 和 version
    } catch (error) {
      console.error(`Failed to execute command: git`);
      console.error(error.message);
      process.exit(1); // 如果执行失败，退出进程并返回非零状态码
    }
  });
```
name： clone下来后的名字
```js
fs.readFile(`${process.cwd()}/${name}/package.json`, (err, data) => {
  if (err) throw err;
  let _data = JSON.parse(data.toString())
  _data.name = name
  _data.version = '1.0.0'
  let str = JSON.stringify(_data, null, 4); // 参数2 可选的转换函数，用于控制生成的 JSON 字符串中每个属性的值，如果不需要可以传入 null。参数3： （数字）缩进空格数，可以是字符串
  fs.writeFile(`${process.cwd()}/${name}/package.json`, str, function (err) {
    if (err) throw err;
  })
});
```

## 9. 发布npm


## 做成什么样的？
通过init 选择vue-cli或者cypridina
通过init 添加参数 选择以上的其中一种

1、可选择vue-cli的基础上加点东西
- [ ]添加请求: axios相关的（参考玄同等）
- [ ]选择UI： gendo-ui-vue3、 ant-desgin
- [ ]添加jenkinsfile

2、使用冬哥写的那个项目
- [✔] 拉取 
- [✔] 修改package:name version
- [ ] 添加参数，拉取不同分支的代码
- 细节调整?

## 在已有项目的基础上：
1. 初始化项目结构，建一个 gendo-cli项目；npm init
2. 建 bin/index.js
3. 添加bin
```js
  "bin": {
    "gendo": "./bin/index.js"
  }
  ```
4. 配置 bin/index.js
```js
#! /usr/bin/env node

const program = require('commander');   // 命令行处理
const download = require('download-git-repo');  // 拉取git文件
const chalk = require('chalk');   // 改变输出文字的颜色？
const ora = require('ora');   // 小图标

```
- #! /usr/bin/env node是指定这个文件使用node执行。
- 需要安装的模块npm i commander download-git-repo chalk ora --save

- commander可以解析用户输入的命令。
- download-git-repo拉取github上的文件。
- chalk改变输出文字的颜色
- ora小图标（loading、succeed、warn等）

```js
program
  .version('0.1.0')
  .option('-i, init [name]', '初始化x-build项目')
  .parse(process.argv);
  ```

.option()

-i 是简写，类似于npm i -g

init后面的[name]可以通过program.init来获取到。

5. 添加提示 gendo -h

```js
if (program.init) {
  const spinner = ora('正在从github下载x-build').start();
  download('codexu/x-build#x-build4.1', program.init, function (err) {
    if(!err){
      // 可以输出一些项目成功的信息
      console.info(chalk.blueBright('下载成功'));
    }else{
      // 可以输出一些项目失败的信息
    }
  })
}

```

ora().start()可以创建一个loading小图标。 >>> 其他图标参考ora
download()从github下载我们需要的项目，因为使用的是分支所以在后面加上了#x-build4.1，默认是master。 参数配置参考download-git-repo
chalk.blueBright()会将输出的文字转化为蓝色。 >>> 其他颜色参考chalk


优化
此时下载的文件与github一致，我想改变package.json，将name改为初始化的项目名，将version改为1.0.0。
此时就使用node自己的api就可以做到：

```js
const fs = require('fs');

fs.readFile(`${process.cwd()}/${program.init}/package.json`, (err, data) => {
  if (err) throw err;
  let _data = JSON.parse(data.toString())
  _data.name = program.init
  _data.version = '1.0.0'
  let str = JSON.stringify(_data, null, 4);
  fs.writeFile(`${process.cwd()}/${program.init}/package.json`, str, function (err) {
    if (err) throw err;
  })
});
```

通过readFile读取文件，writeFile写入文件，写入时注意要传入字符串JSON.stringify(_data, null, 4)，通过这样的方式可以输出格式化的json文件。
通过node可以很轻松的就做到，这里发展空间很大，就不再多说。
