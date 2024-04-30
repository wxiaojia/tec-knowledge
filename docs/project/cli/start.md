问题:
- 搭建一个脚手架的工程 一
- 命令参数模块 三
- 用户交互模块 四
- 文件拷贝模块 五
- 动态文件生成模块 六
- 自动安装依赖模块 七
- 怎么拉取git/bitbucket 文件代码 八
- 插件：
  - commander可以解析用户输入的命令。
  - download-git-repo拉取github上的文件。
  - chalk改变输出文字的颜色
  - ora小图标（loading、succeed、warn等）

## 
### 创建项目+通用代码
埋点
http工具
工具方法
组件库

## 做成什么样的？
通过init 选择vue-cli/create-vite或者cypridina
通过init 添加参数 选择以上的其中一种

1、可选择vue-cli/create-vite的基础上加点东西
- [✔] vue-cli的基础上生成
- [ ] 添加请求: axios相关的（参考玄同\国营等）graphql?以哪个为模板
- [ ] 选择UI： gendo-ui-vue3、 ant-desgin-vue、当前流行的UI, 是否按需加载？
- [ ] 添加CICD模块：nginx、jenkinsfile、docker, 选择：1）在docker中打包的，2）直接配置jenkinsfile
- [ ] 路由
- [ ] css处理器 scss less stylus
- [ ] 状态 vuex pinia

2、使用冬哥写的cypridina
- [✔] 拉取
- [✔] 修改package:name version
- [✔] 添加参数，拉取不同分支的代码，--> 2)

3、类似玄同的模板

通用功能：
· 模板仓库?
· 选择分支功能？ --询问？
· 添加CICD模块
· 通用业务模块: 
  axios 登录，菜单配置，用户管理，字典管理，角色管理等
· 提供可插拔的功能插件（权限、埋点、sentry等 ?
· 基于接口定义生成接口定义代码的功能 --- 目前可通过swagger生成api文件夹
· 有全栈项目初始化能力 -- 设置拉取的仓库模板
代码格式：
· 统一代码格式 eslint + prettier


关于模板：
1、像玄同v3的，可以选择安装gendo-ui-vue3、gendo-utils、gendo-shared
2、像国银的，使用yudao-ui-admin-vben(ant-design-vue的)或者yudao-ui-admin-vue3(element-plus)的
3、其他不是后台管理的项目？

关于功能：
· 通用业务模块: 
  axios 登录，菜单配置，用户管理，字典管理，角色管理等（yudao-ui-admin-vben有或者玄同？可做成可插拔的）


## 项目改成ts:
1、更好的兼容性
2、可以使用新的语法糖

## 一、 搭建一个monorepo 风格的脚手架工程
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
3. example
- 仿本地：已安装脚手架的情况下，用脚手架生成项目
- 安装依赖 package/gendo-cli的包名 name："gendo-cli": "workspace:*",
- script跑的时候添加 gendo，bin定的名字

测试gendo命令需要在example目录中及进行

## 二、 npm link,为什么使用 monorepo 而不是用npm link
- 如果在本地有多个版本的脚手架仓库，在仓库A中修改代码后，运行 gendo 命令后，发现更改的代码不生效。
- 原因：因为已经在仓库B的脚手架工程中运行 npm link，导致我们在运行 gendo 命令后是执行仓库B中的代码
- 解决：要先在仓库B的脚手架工程中运行 npm unlink 后，然后在仓库A中的脚手架工程中运行 npm link 后，修改仓库A中的代码才能生效。

使用monorepo多包工程，就不需要去执行npm link。且example可以引用本地开发的脚手架，实现脚手架工程的本地调试，不需要依赖npm

## 三、 yargs/commander解析命令参数
### API 设计：
yargs 设计了一个非常灵活的 API，它支持链式调用和配置对象，并提供了丰富的功能和选项。
commander 也提供了一个方便易用的 API，它使用了一种更加命令式的风格来定义命令和选项。

### 子命令支持：
yargs 在定义命令和子命令时比较直观，并且支持多级子命令。
commander 也支持定义命令和子命令，但语法上稍微有些不同，需要显式地创建命令对象。

### 类型转换：
yargs 可以自动转换命令行参数为指定的类型，例如字符串、数字等。
commander 也提供了类型转换的功能，但需要手动指定。


### 异步命令：
yargs 提供了异步命令的支持，可以处理异步命令处理逻辑。
commander 在处理异步命令时可能需要更多的手动处理。

### 文档和社区：
yargs 拥有丰富的文档和活跃的社区支持，同时也有很多插件可以扩展功能。
commander 同样拥有良好的文档和社区支持，但相比之下可能没有 yargs 那么丰富。

## 总结
综上所述，yargs 和 commander 都是功能强大且流行的命令行解析工具，可以根据自己的喜好和项目需求来选择使用其中之一。

如果需要更灵活的 API 和更多的功能，可以考虑使用 yargs，

如果更喜欢更简洁的语法和易用性，可以选择 commander。
## 四、 inquirer 开源库来实现询问式的交互
## 五、 copy-dir 拷贝文件
## 六、 模板根据需求生成代码， mustache
## 七、 自动安装依赖模块 Node
## 八、 怎么拉取git/bitbucket 文件代码
前提：git/bitbucket 已ssh设置
### clone并选择分支
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

### 修改项目名字和版本
此时下载的文件与github一致，我想改变package.json，将name改为初始化的项目名，将version改为1.0.0。
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

## 九 发布npm