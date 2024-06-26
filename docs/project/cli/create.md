
- 如何搭建一个脚手架的工程
- 如何开发和调试一个脚手架
- [脚手架中如何接收和处理命令参数](#getParams)
- [脚手架中如何和用户交互](#prompt)
- [脚手架中如何拷贝一个文件夹或文件](#copy)
- [脚手架中如何动态生成一个文件](#template)
- [脚手架中如何处理路径问题](#dealRoute)
- [脚手架中如何自动安装模板所需依赖](#install)

## 1、搭建一个 monorepo 风格的脚手架工程
### 1.1、如何用 Node.js 运行 js
> 为了避免 Node.js 版本差异导致奇怪的问题，建议安装 16 以上版本的 Node.js 。

随便找个地方建个一个 index.js 文件，并在该文件中添加如下代码：
```js
console.log('Welcome to Polarizon');  
```
在该文件的地址栏上输出 cmd 打开命令行窗口，输入 node index.js 命令，回车运行该命令。

可以在命令行窗口中看到打印了 Welcome to Polarizon

### 1.2、声明自己的命令
如果你熟悉 Vue , 肯定对 vue-cli 这个脚手架有一定了解，比如运行 vue create myapp 命令来创建一个 Vue 工程。如果我们没有运行 npm install \-g vue-cli 安装 vue-cli 脚手架，在命令行窗口中直接运行 vue create myapp，会报错
> 'vue'不是内部或外部命令，也不是可运行的程序或批处理文件

可见 vue 不是系统命令， vue 只是 vue-cli 脚手架声明的一个命令。

那怎么给脚手架声明一个命令，其实非常简单，跟我来操作。

随便找个地方创建 polarizon-cli 的文件夹，进入该文件夹后，在其地址栏上输出 cmd 打开命令行窗口，

运行 npm init 命令来初始化一个脚手架工程，运行成功后，会在该文件夹中生成一个 pakeage.json 文件。我们在 pakeage.json 中添加 bin 字段，来声明一个命令，添加后的代码如下所示：

```js
{  
   "name": "polarizon-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
    "bin":{  
    "polarizon": "./bin/index.js"  
    }  
} 
 ```
这样我们就声明了一个 polarizon 的命令，另外 ./bin/index.js 是运行 polarizon 命令后会运行的 js 文件的相对路径。

接着我们在 polarizon-cli 的文件夹中创建一个 bin 文件夹，在 bin 文件夹中创建一个 index.js 文件，并在该文件中添加如下代码：
```js
#!/usr/bin/env node 

console.log('Welcome to Polarizon');
```

> 注意在文件头部添加 #!/usr/bin/env node，否则运行后会报错！！！告诉服务器用什么语言去解析这个文件

这样就完成了一个最基础的脚手架工程，接下来在命令行窗口输入 Polarizon 命令，运行该命令。


会发现，还是报错，提示 Polarizon 命令不是系统命令，当然不是声明命令的方法错误。

假如你把这个脚手架发布到 npm 上后。由于 polarizon-cli/pakeage.json 中 name 的值为 polarizon-cli，所以我们运行 npm install \-g polarizon-cli 将脚手架安装到本地后，再运行 polarizon 命令，就会发现运行成功。

在实际开发脚手架过程中不可能这么做，所以我们还要实现本地调试脚手架的能力，实现起来也非常简单，一个命令搞定。

这个命令就是 **npm link** 

输入 npm link 命令运行后，再输入 polarizon 命令，回车运行，看到的结果如下图所示。
![运行结果](./asserts/Image1.png)

到此，我们成功的声明了一个 polarizon 命令。

### 1.3、npm link 的弊端
使用 npm link 来实现本地调试有一个弊端。比如在本地有多个版本的脚手架仓库，在仓库A中修改代码后，运行 polarizon 命令后，发现更改的代码不生效。这是因为已经在仓库B的脚手架工程中运行 npm link，导致我们在运行 polarizon 命令后是执行仓库B中的代码，在仓库A中修改代码能生效才怪。要先在仓库B的脚手架工程中运行 npm unlink 后，然后在仓库A中的脚手架工程中运行 npm link 后，修改仓库A中的代码才能生效。

为了解决这个弊端，我们使用 pnpm 来搭建 monorepo 风格的脚手架工程。

在 monorepo 风格的工程中可以含有多个子工程，且每个子工程都可以独立编译打包后将产物发成 npm 包，故又称 monorepo 为多包工程。

由于脚手架发布到 npm 上的包名为 polarizon-cli ，修改调试子工程的 package.json 文件中的代码，代码修改部分如下所示：
```js
{
 "scripts": {
    "polarizon": "polarizon --help"  
 },  
 "dependencies": { 
    "polarizon-cli": "workspace:*"  
 }  
}  
```
注意，在 dependencies 字段中声明 polarizon-cli 依赖包的版本，要用workspace:* 来定义，而不是具体版本号来定义。

> 在 pnpm 中使用 workspace: 协议定义某个依赖包版本号时，pnpm 将只解析存在工作空间内的依赖包，不会去下载解析 npm 上的依赖包。

把 polarizon-cli 依赖包引入，执行 pnpm i 安装依赖，其效果就跟执行 npm install \-g polarizon-cli一样，只不过不是全局安装而已，只在调试子工程内安装 polarizon-cli 脚手架。然后调试子工程就直接引用脚手架子工程本地编译打包后的产物，而不是发布到 npm 上的产物，彻底做到本地调试。

另外脚手架子工程和调试子工程是在同一个工程中，这样就做一对一的调试，从而解决了使用 npm link 来实现本地调试的弊端。

同时在 scripts 定义了脚本命令，在调试工程中执行 pnpm polarizon 既是执行了 polarizon 命令，不用脚手架工程中执行 npm link 就可以运行 polarizon 命令。

### 1.4、monorepo 风格的脚手架工程
下面开始使用 pnpm 搭建 monorepo 风格的脚手架工程，首先在命令行窗口中输入以下代码，执行安装 pnpm 。在PowerShell运行

> iwr https://get.pnpm.io/install.ps1 -useb | iex  
然后重新找个地方创建 polarizon 文件夹，进入该文件夹后，在其地址栏上输出 cmd 打开命令行窗口。

输入 **pnpm init** 初始化工程，pnpm 是使用 workspace (工作空间) 来搭建一个 monorepo 风格的工程。

所以我们要 polarizon 文件夹中创建 **pnpm-workspace.yaml** 工作空间配置文件，并在该文件中添加如下配置代码。
```js
packages:   
 - 'packages/*'   
 - 'examples/*'  
 ```
配置后，声明了 packages 和 examples 文件夹中子工程是同属一个工作空间的，工作空间中的子工程编译打包的产物都可以被其它子工程引用。

在 packages 文件夹中新建 polarizon-cli 文件夹，在其地址栏上输出 cmd 打开命令行窗口。

输入 **pnpm init** 命令，执行来初始化一个工程，执行成功后，会在该文件夹中生成一个 pakeage.json 文件。

我们在 pakeage.json 中添加 bin 字段，来声明 polarizon 命令，添加后的代码如下所示：
```js
{  
 "name": "polarizon-cli",  
 "version": "1.0.0",  
 "description": "",  
 "main": "index.js",  
 "scripts": {  
 "test": "echo \"Error: no test specified\" && exit 1"  
 },  
 "author": "",  
 "license": "ISC",  
 "bin":{  
 "polarizon": "./bin/index.js"  
 }  
}  
```
在 packages/polarizon-cli 文件夹中新建 **bin** 文件夹，在 bin 文件夹中新建 index.js 文件，并在该文件中添加如下代码：
```js
#!/usr/bin/env node  

console.log('Welcome to polarizon');  
```
 examples 文件夹中新建 **app** 文件夹，在其地址栏上输出 cmd 打开命令行窗口， 运行 pnpm init 命令来初始化一个工程，运行成功后，会在该文件夹中生成一个 pakeage.json 文件。

我们在 pakeage.json 中添加 dependencies 字段，来添加 polarizon-cli 依赖。再给 scripts 增加一条自定义脚本命令。添加后的代码如下所示：
```js
{  
 "name": "app",  
 "version": "1.0.0",  
 "description": "",  
 "main": "index.js",  
 "scripts": {  
 "polarizon": "polarizon"  // +
 },  
 "author": "",  
 "license": "ISC",  
 "dependencies": {  // +
 "polarizon-cli": "workspace:*"  // +
 }  // +
}  
```
然后在最外层根目录下运行 **pnpm i** 命令，安装依赖。安装成功后，在 app 文件夹目录下运行 pnpm polarizon，会发现命令行窗口打印出 Welcome to polarizon World，说明你的 monorepo 风格的脚手架工程的搭建成功了。

![运行结果](./asserts/Image2.png)

此时整个工程的目录结构如下所示
```js
|-- polarizon  
      |-- package.json  
      |-- pnpm-lock.yaml  
      |-- pnpm-workspace.yaml  
      |-- examples  
      |   |-- app  
      |       |-- package.json  
      |-- packages  
          |-- polarizon-cli  
              |-- package.json  
              |-- bin  
                  |-- index.js  
```
### 1.5、脚手架必备的模块
一个最简单的脚手架包含以下几个模块。

- 命令参数模块
- 用户交互模块
- 文件拷贝模块
- 动态文件生成模块
- 自动安装依赖模块

下面我们来一一将他们实现。

<a id="getParams"></a>
## 2、命令参数模块
### 2.1、获取命令参数
Node.js 中的 process 模块提供了当前 Node.js 进程相关的全局环境信息，比如命令参数、环境变量、命令运行路径等等。
```js
const process = require('process');  
// 获取命令参数  
console.log(process.argv);  
```

脚手架提供的 polarizon 命令后面还可以设置参数，标准的脚手架命令参数需要支持两种格式，比如：
```js
polarizon --name=orderPage  
polarizon --name orderPage  
```
如果通过 process.argv 来获取，要额外处理两种不同的命令参数格式，不方便。

这里推荐 **yargs 开源库来解析命令参数** 运行以下命令安装 yargs：
```js
pnpm add yargs --F polarizon-cli
```

pnpm add是 pnpm 中安装依赖包的命令， --F polarizon-cli，是指定依赖安装到 polarizon-cli 子工程中。

> 这里要注意，polarizon-cli 是取 polarizon-cli 子工程中 package.json 中 name 字段的值，而不是 polarizon-cli 子工程文件夹的名称。

yargs 的使用非常简单，其提供的 argv 属性是对两个格式的命令参数的处理结果。在 bin/index.js 添加如下代码：
```js
#!/usr/bin/env node  
const yargs = require('yargs');  
console.log('name', yargs.argv.name);  
```
> 注意，以上代码是在 Node.js 环境中运行，Node.js 的模块是遵循 CommonJS 规范的，如果要依赖一个模块，要使用 Node.js 内置 require 系统函数引用模块使用。

在 app 文件夹目录下运行 **pnpm polarizon -- --name=orderPage** ，

注意，在 pnpm polarizon 后面需要加上两个连字符（--），这是为了告诉 pnpm 后面的参数是传递给命令polarizon 本身的，而不是传递给 pnpm 的。

结果如下图所示：
![运行结果](./asserts/Image3.png)

可以通过 yargs.argv.name 获取命令参数 name 的值。

### 2.2、设置子命令
假如脚手架要对外提供多个功能，不能将所有的功能都集中在 polarizon 命令中实现。

可以通过 yargs 提供的 command 方法来设置一些子命令，让每个子命令对应各自功能，各司其职。

**yargs.command** 的用法是  yargs.command(cmd, desc, builder, handler) 。

- cmd：字符串，子命令名称，也可以传递数组，如 ['create', 'c']，表示子命令叫 create，其别名是 c；
- desc：字符串，子命令描述信息；
- builder：一个返回数组的函数，子命令参数信息配置，比如可以设置参数：
  - alias：别名；
  - demand：是否必填；
  - default：默认值；
  - describe：描述信息；
  - type：参数类型，string | boolean | number。
- handler: 函数，可以在这个函数中专门处理该子命令参数。

下面我们来设置一个用来生成一个模板的子命令，把这个子命令命名为create。

修改在 bin/index.js 文件中的代码，如下所示：
```js
#!/usr/bin/env node  
const yargs = require('yargs');  
yargs.command(  
 ['create', 'c'],  
 '新建一个模板',  
 function (yargs) {  
   return yargs.option('name', {    // vue create mySelf 能不能像vue创建的一样去除 -- --name
     alias: 'n',  
     demand: true,  
     describe: '模板名称',  
     type: 'string'  
   })  
 },  
 function (argv) {  
   console.log('argv', argv);  
 }  
).argv;  
```
在 app 文件夹目录下分别运行 **pnpm polarizon create -- --name=orderPage** 和 **pnpm polarizon c -- --name=orderPage** 命令，
执行结果如下图所示：
![运行结果](./asserts/Image4.png)

在上面我们配置了子命令 create 的参数 name 的一些参数信息。那这些要怎么展示给用户看呢？其实只要我们输入子命令的参数有错误，就会在命令行窗口中显示这些参数信息。

在 app 文件夹目录下运行 pnpm polarizon c -- --abc 命令，执行结果如下图所示：
![运行结果](./asserts/Image5.png)

到此为止，我们最简单地实现了脚手架和用户之间的交互能力，但是如果自定义参数过多，那么命令行参数的交互方法对于用户来说是非常不友好的。所以我们还要实现一个用户交互模块，如何实现请看下一小节。

<a id="prompt"></a>
## 3、用户交互模块
讯问式的交互，比如我们在运行 npm init，通过询问式的交互完成 package.json 文件内容的填充。

这里推荐使用 **inquirer** 开源库来实现询问式的交互，运行以下命令安装 inquirer：

> pnpm add inquirer@8.2.5 --F polarizon-cli
为了使用 require 引入 inquirer ，要使用 8.2.5 版本的 inquirer。

这里我们主要使用了 inquirer 开源库的三个方面的能力：
- 询问用户问题
- 获取并解析用户的输入
- 检测用户的答案是否合法

###  inquirer.prompt()
主要通过 inquirer.prompt() 来实现。prompt 函数接收一个数组，数组的每一项都是一个询问项，询问项有很多配置参数，下面是常用的配置项。

- type：提问的类型，常用的有
  -  输入框：input；
  - 确认：confirm；
  - 单选组：list；
  - 多选组：checkbox；
- name：存储当前问题答案的变量；
- message：问题的描述；
- default：默认值；
- choices：列表选项，在某些type下可用；
- validate：对用户的答案进行校验；
- filter：对用户的答案进行过滤处理，返回处理后的值。

比如我们创建一个模板文件，大概会询问用户：模板文件名称、模板类型、使用什么框架开发、使用框架对应的哪个组件库开发等等。

### 实现功能

在 bin 文件夹中新建 inquirer.js 文件夹，在里面添加如下代码：
```js
const inquirer = require('inquirer');  
  
function inquirerPrompt(argv) {  
  const { name } = argv;  
  return new Promise((resolve, reject) => {  
    inquirer.prompt([  
      {  
        type: 'input',  
        name: 'name',  
        message: '模板名称',  
        default: name,  
        validate: function (val) {  
          if (!/^[a-zA-Z]+$/.test(val)) {  
            return "模板名称只能含有英文";  
          }  
          if (!/^[A-Z]/.test(val)) {  
            return "模板名称首字母必须大写"  
          }  
          return true;  
        },  
      },  
      {  
        type: 'list',  
        name: 'type',  
        message: '模板类型',  
        choices: ['表单', '动态表单', '嵌套表单'],  
        filter: function (value) {  
          return {  
            '表单': "form",  
            '动态表单': "dynamicForm",  
            '嵌套表单': "nestedForm",  
          }[value];  
        },  
      },  
      {  
        type: 'list',  
        message: '使用什么框架开发',  
        choices: ['react', 'vue'],  
        name: 'frame',  
      }  
    ]).then(answers => {  
      const { frame } = answers;  
      if (frame === 'react') {  
        inquirer.prompt([  
          {  
            type: 'list',  
            message: '使用什么UI组件库开发',  
            choices: [  
              'Ant Design',  
            ],  
            name: 'library',  
          }  
        ]).then(answers1 => {  
          resolve({  
            ...answers,  
            ...answers1,  
          })  
        }).catch(error => {  
          reject(error)  
        })  
      }  
  
      if (frame === 'vue') {  
        inquirer.prompt([  
          {  
            type: 'list',  
            message: '使用什么UI组件库开发',  
            choices: [ 'Element'],  
            name: 'library',  
          }  
        ]).then(answers2 => {  
          resolve({  
            ...answers,  
            ...answers2,  
          })  
        }).catch(error => {  
          reject(error)  
        })  
      }  
    }).catch(error => {  
      reject(error)  
    })  
  })  
  
}  
exports.inquirerPrompt = inquirerPrompt;  
```
其中 inquirer.prompt() 返回的是一个 Promise，我们可以用 then 获取上个询问的答案，根据答案再发起对应的内容。

在 bin/index.js 中引入 inquirerPrompt 。
```js
#!/usr/bin/env node  
  
const yargs = require('yargs');  
const { inquirerPrompt } = require("./inquirer");  
  
yargs.command(  
  ['create', 'c'],  
  '新建一个模板',  
  function (yargs) {  
    return yargs.option('name', {  
      alias: 'n',  
      demand: true,  
      describe: '模板名称',  
      type: 'string'  
    })  
  },  
  function (argv) {  
    inquirerPrompt(argv).then(answers =>{  
      console.log(answers)  
    })  
  }  
).argv;  
  ```
在 app 文件夹目录下运行 pnpm polarizon c -- --n Input 命令，执行结果如下图所示：

![运行结果](./asserts/Image6.png)

可以很清楚地看到“在使用什么框架开发”的询问中回答不同，下一个“使用什么UI组件库的开发”的询问可选项不一样。

回答完成后，图中可以清楚地看到答案格式

<a id="copy"></a>
## 4、文件夹拷贝模块
要生成一个模板文件，最简单的做法就是执行脚手架提供的命令后，把脚手架中的模板文件，拷贝到对应的地方。模板文件可以是单个文件，也可以是一个文件夹。

在 Node.js 中拷贝文件夹并不简单，需要用到递归，这里推荐使用开源库**copy-dir**来实现拷贝文件。
运行以下命令安装 copy-dir 。

> pnpm add copy-dir --F polarizon-cli

在 bin 文件夹中新建 copy.js 文件，在里面添加如下代码：
```js
const copydir = require('copy-dir');
const fs = require('fs');

function copyDir(from, to, options) {
  copydir.sync(from, to, options);
}

function checkMkdirExists(path) {
  return fs.existsSync(path)
};

exports.checkMkdirExists = checkMkdirExists;
exports.copyDir = copyDir;
```
copyDir 方法实现非常简单，难的是如何使用,
我们在 bin 文件夹中新建 template 文件夹，用来存放模板文件，比如在 template 文件夹中创建一个 form 文件夹来存放表单模板，我们随意在 form 文件夹中创建一个 index.js，在里面随便写些内容。其目录结构如下所示：

```markdown
  |-- polarise
      |-- package.json
      |-- pnpm-lock.yaml
      |-- pnpm-workspace.yaml
      |-- examples
      |   |-- app
      |       |-- package.json
      |-- packages
          |-- polarizon-cli
              |-- package.json
              |-- bin
                  |-- template
                      |-- form
                          |-- index.js
                  |-- copy.js
                  |-- index.js
                  |-- inquirer.js
```

下面来实现把 
**packages/polarizon-cli/bin/template/form** 这个文件夹拷贝到 **examples/app/src/pages/OrderPage** 中 。
在 bin/index.js 修改代码，修改后的代码如下所示：
```js
#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const { inquirerPrompt } = require("./inquirer");
const { copyDir, checkMkdirExists } = require("./copy");

yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demand: true,
      describe: '模板名称',
      type: 'string'
    })
  },
  function (argv) {
    inquirerPrompt(argv).then(answers => {
      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(),`./src/pages/${name}`)
      );
      if (isMkdirExists) {
        console.log(`${name}文件夹已经存在`)
      } else {
        copyDir(
          path.resolve(__dirname, `./template/${type}`),
          path.resolve(process.cwd(), `./src/pages/${name}`)
        )
      }
    })
  }
).argv;
```
使用拷贝文件方法 copyDir 的难点是参数 from 和 to 的赋值。其中 from 表示要拷贝文件的路径，to 表示要把文件拷贝到那里的路径。这里的路径最好使用绝对路径，因为在 Node.js 中使用相对路径会出现一系列奇奇怪怪的问题。

<a id="dealRoute"></a>
### 4.1、脚手架中的路径处理
我们可以用 Node.js 中的 path 模块提供的 **path.resolve( [from…], to ) 方法将路径转成绝对路径**，就是将参数 to 拼接成一个绝对路径，[from … ] 为选填项，可以设置多个路径，如 path.resolve('./aaa', './bbb', './ccc') ，使用时要注意path.resolve 的路径拼接规则：

- 从后向前拼接路径；
- 若 to 以  / 开头，不会拼接到前面的路径；
- 若 to 以 ../ 开头，拼接前面的路径，且不含最后一节路径；
- 若 to 以 ./ 开头或者没有符号，则拼接前面路径。

从以上拼接规则来看，使用 path.resolve 时，要特别注意参数 to 的设置。

#### copyDir的参数设置
下面来介绍一下，使用 copyDir 方法时，参数如何设置：

- 将 copyDir 的参数 from 设置为 path.resolve(__dirname, `./template/${type}`)，

其中 **__dirname 是用来动态获取当前文件模块所属目录的绝对路径**。比如在 bin/index.js 文件中使用 __dirname ，__dirname 表示就是 bin/index.js 文件所属目录的绝对路径 F:\polarise-cli\packages\polarizon-cli\bin。


因为模板文件存放在 bin/template 文件夹中 ，copyDir 是在 bin/index.js 中使用，bin/template 文件夹相对 bin/index.js 文件的路径是 ./template，所以把 path.resolve 的参数 to 设置为 ./template/${type}，其中 type 是用户所选的模板类型。


假设 type 的模板类型是 form，那么 path.resolve(__dirname, `./template/form`) 得到的绝对路径是 F:\polarise-cli\packages\polarizon-cli\bin\template\form。


- 将 copyDir 的参数 to 设置为 path.resolve(process.cwd(), `${name}`)，
其中 **process.cwd() 当前 Node.js 进程执行时的文件所属目录的绝对路径**。比如在 bin 文件夹目录下运行 node index.js 时，process.cwd() 得到的是 F:\polarise-cli\packages\polarizon-cli\bin。


运行 node index.js 相当运行 polarizon 命令。而在现代前端工程中都是在 package.json 文件中scripts 定义了脚本命令，如下所示：

```json
{
  "name": "app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "polarizon": "polarizon" 
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": { 
    "polarizon-cli": "workspace:*"  
  } 
}
```
运行 pnpm polarizon 就相当运行 polarizon 命令，那么执行 pnpm polarizon 时，当前 Node.js 进程执行时的文件是 package.json  文件。那么 process.cwd() 得到的是 F:\polarise-cli\examples\app。


因为要把 packages/polarizon-cli/bin/template/form 这个文件夹拷贝到 examples/app/src/pages/OrderPage 中，且 process.cwd() 的值是F:\polarise-cli\examples\app，src/pages 文件夹相对 examples/app 的路径是 ./src/pages ，所以把 path.resolve 的参数 to 设置为 ./src/pages/${name}，其中 name 是用户所输入的模板名称。


### 4.2、目录守卫
在 app 文件夹目录下运行 
> pnpm polarizon create -- --name=OrderPage，
看能不能成功得把 packages/polarizon-cli/bin/template/form 这个文件夹拷贝到 examples/app/src/pages/OrderPage 中。

![报错](./asserts/Image7.png)

报错了，提示 examples/app/src/pages 文件夹不存在。为了防止这种报错出现，我们要实现一个目录守护的方法 **mkdirGuard** ，比如 examples/app/src/pages 文件夹不存在，就创建一个 examples/app/src/pages 文件夹。
在 bin/copy.js 文件中，修改代码，如下所示：

```js
const copydir = require('copy-dir');
const fs = require('fs');
const path = require('path');

function mkdirGuard(target) {
  try {
    fs.mkdirSync(target, { recursive: true });
  } catch (e) {
    mkdirp(target)
    function mkdirp(dir) {
      if (fs.existsSync(dir)) { return true }
      const dirname = path.dirname(dir);
      mkdirp(dirname);
      fs.mkdirSync(dir);
    }
  }
}

function copyDir(form, to, options) {
  mkdirGuard(to);
  copydir.sync(form, to, options);
}

function checkMkdirExists(path) {
  return fs.existsSync(path)
};

exports.checkMkdirExists = checkMkdirExists;
exports.mkdirGuard = mkdirGuard;
exports.copyDir = copyDir;
```
fs.mkdirSync 的语法格式：fs.mkdirSync(path[, options])，创建文件夹目录。
- path：文件夹目录路径；
- options：recursive 表示是否要创建父目录，true 要。

fs.existsSync 的语法格式：fs.existsSync(pach)，检测目录是否存在，如果目录存在返回 true ，如果目录不存在返回false。
- path：文件夹目录路径。

path.dirname 的语法格式：path.dirname(path)，用于获取给定路径的目录名。
- path：文件路径。

在 mkdirGuard 方法内部，当要创建的目录 target 父级目录不存在时，调用fs.mkdirSync(target)，会报错走 catch 部分逻辑，在其中递归创建父级目录，使用 fs.existsSync(dir) 来判断父级目录是否存在，来终止递归。这里要特别注意 fs.mkdirSync(dir) 创建父级目录要在 mkdirp(dirname) 之前调用，才能形成一个正确的创建顺序，否则创建父级目录过程会因父级目录的父级目录不存在报错。

我们再次在 app 文件夹目录下运行 pnpm polarizon create -- --name=OrderPage，看这次能不能成功得把 packages/polarizon-cli/bin/template/form 这个文件夹拷贝到 examples/app/src/pages/OrderPage 中。
成功添加，添加结果如下所示：
![成功](./asserts/Image8.png)

然后再运行 pnpm polarizon create -- --name=OrderPage 命令，会发现控制台打印出模板已经存在在提示。
![已存在](./asserts/Image9.png)

这是为了防止用户修改后的模板文件，运行命令后被重新覆盖到初始状态。所以我们引入一个校验模板文件是否存在的  checkMkdirExists 方法，内部采用 fs.existsSync 来实现。

## 5、文件拷贝模块
文件拷贝分三步来实现，

### fs.readFileSync
使用 **fs.readFileSync 读取被拷贝的文件内容**，然后创建一个文件，再使用 fs.writeFileSync 写入文件内容。
在 bin/copy.js 文件，在里面添加如下代码：
```js
function copyFile(from, to) {
  const buffer = fs.readFileSync(from);
  const parentPath = path.dirname(to);

  mkdirGuard(parentPath)

  fs.writeFileSync(to, buffer);
}

exports.copyFile = copyFile;
```

### copyFile
接下来我们使用 copyFile 方法，在 bin/index.js 修改代码，修改后的代码如下所示：
```js
#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const { inquirerPrompt } = require("./inquirer");
const { copyDir } = require("./copy");

yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demand: true,
      describe: '模板名称',
      type: 'string'
    })
  },
  function (argv) {
    inquirerPrompt(argv).then(answers => {
      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(),`./src/pages/${name}/index.js`)
      );
      if (isMkdirExists) {
        console.log(`${name}/index.js文件已经存在`)
      } else {
        copyFile(
          path.resolve(__dirname, `./template/${type}/index.js`),
          path.resolve(process.cwd(), `./src/pages/${name}/index.js`),
          {
            name,
          }
        )
      }
    })
  }
).argv;
```

copyFile和copyDir使用的区别在参数，copyFile要求参数 from 和参数 to 都精确到文件路径。

在app文件夹目录下运行 
> pnpm polarizon create \-- \--name=OrderPage

<a id="template"></a>
## 6、动态文件生成模块
假设脚手架中提供的模板文件中某些信息需要根据用户输入的命令参数来动态生成对应的模板文件。
比如下面模板文件中 App 要动态替换成用户输入的命令参数 name 的值，该如何实现呢？
```js
import React from 'react';
const App = () => {
  return (
    <div></div>
  );
};
export default App;
```

这里推荐使用开源库mustache来实现，运行以下命令安装 mustache 。
> pnpm add mustache --F polarizon-cli

我们在 packages/polarizon-cli/bin/template/form 文件夹中创建一个 index.tpl 文件，内容如下：

```js
import React from 'react';
const {{name}} = () => {
  return (
    <div></div>
  );
};
export default {{name}};
```

先写一个 **readTemplate 方法来读取这个 index.tpl 动态模板文件内容**。在 bin/copy.js 文件，在里面添加如下代码：
```js
const Mustache = require('mustache');

function readTemplate(path, data = {}) {
  const str = fs.readFileSync(path, { encoding: 'utf8' })
  return Mustache.render(str, data);
}

exports.readTemplate = readTemplate;
```

readTemplate 方法接收两个参数，path 动态模板文件的相对路径，data 动态模板文件的配置数据。

使用 Mustache.render(str, data) 生成模板文件内容返回，因为 Mustache.render 的第一个参数类型是个字符串，所以在调用 fs.readFileSync 时要指定 encoding 类型为 utf8，否则 fs.readFileSync 返回 Buffer 类型数据。

在写一个 copyTemplate 方法来拷贝模板文件到对应的地方，跟 copyFile 方法非常相似。在 bin/copy.js 文件，在里面添加如下代码：
```js
function copyTemplate(from, to, data = {}) {
  if (path.extname(from) !== '.tpl') {
    return copyFile(from, to);
  }
  const parentToPath = path.dirname(to);
  mkdirGuard(parentToPath);
  fs.writeFileSync(to, readTemplate(from, data));
}
```

**path.extname(from) 返回文件扩展名**，比如 path.extname(index.tpl) 返回 .tpl。
在 bin/index.js 修改代码，修改后的代码如下所示：
```js
#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const { inquirerPrompt } = require("./inquirer");
const { copyTemplate } = require("./copy");

yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demand: true,
      describe: '模板名称',
      type: 'string'
    })
  },
  function (argv) {
    inquirerPrompt(argv).then(answers => {
      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(),`./src/pages/${name}/index.js`)
      );
      if (isMkdirExists) {
        console.log(`${name}/index.js文件已经存在`)
      } else {
        copyTemplate(
          path.resolve(__dirname, `./template/${type}/index.tpl`),
          path.resolve(process.cwd(), `./src/pages/${name}/index.js`),
          {
            name,
          }
        )
      }
    })
  }
).argv;
```

在 app 文件夹目录下运行 
> pnpm polarizon create -- --name=OrderPage

![模板生成](./asserts/Image10.png)

### 6.1、mustache 简介
以上的案例是 mustache 最简单的使用，下面来额外介绍一些常用的使用场景。
熟悉一下 mustache 的语法:

```js
{{key}} 简单绑定
{{#key}} {{/key}} 循环渲染
{{^key}} {{/key}} 条件渲染
{{.}} 数组
{{&key}} 不转义html
```


#### 6.1.1、简单绑定
使用 key 语法，key 要和 Mustache.render 方法中的第二个参数（一个对象）的属性名一致。
例如：
```js
Mustache.render('<span>{{name}}</span>',{name:'张三'})
```
输出：
```html
<span>张三</span>
```


#### 6.1.2、绑定子属性
例如：
```js
Mustache.render('<span>{{ifno.name}}</span>', { ifno: { name: '张三' } })
```

输出：
```html
<span>张三</span>
```

#### 6.1.3、循环渲染
如果 key 属性值是一个数组，则可以使用 #key /key 语法来循环展示。 其中 #key 标记表示从该标记以后的内容全部都要循环展示，/key 标记表示循环结束。
例如：
```js
Mustache.render(
  '<span>{{#list}}{{name}}{{/list}}</span>',
  {
    list: [
      { name: '张三' },
      { name: '李四' },
      { name: '王五' },
    ]
  }
)
```
输出：
```html
<span>张三李四王五</span>
```
如果 list 的值是 ['张三','李四','王五']，要把 name 替换成 . 才可以渲染。
```js
Mustache.render(
  '<span>{{#list}}{{.}}{{/list}}</span>',
  {
    list: ['张三','李四','王五']
  }
)
```


#### 6.1.4、循环中二次处理数据
Mustache.render 方法中的第二个参数是个对象，其属性值可以是一个函数，渲染时候会执行函数输出返回值，函数中可以用 this 获取第二个参数的上下文。
例如：
```js
Mustache.render(
  '<span>{{#list}}{{info}}{{/list}}</span>',
  {
    list: [
      { name: '张三' },
      { name: '李四' },
      { name: '王五' },
    ],
    info() {
      return this.name + ',';
    }
  }
)
```
输出：
```html
<span>张三,李四,王五,</span>
```


#### 6.1.5、条件渲染
使用 #key /key 语法 和 ^key /key 语法来实现条件渲染，当 key 为 false、0、[]、{}、null，既是 key == false 为真，#key /key 包裹的内容不渲染，^key /key 包裹的内容渲染
例如：
```js
Mustache.render(
  '<span>{{#show}}显示{{/show}}{{^show}}隐藏{{/show}}</span>',
  {
    show: false
  }
)
```
输出：
```html
<span>隐藏</span>
```

#### 6.1.6、不转义 HTML 标签
使用 &key 语法来实现。
例如：
```js
Mustache.render(
  '<span>{{&key}}</span>',
  {
    key: '<span>标题</span>'
  }
)
```
输出：
```html
<span><span>标题</span></span>
```
<a id="install"></a>
## 7、自动安装依赖模块
假设模板是这样的：
```js
import React from 'react';
import { Button, Form, Input } from 'antd';

const App = () => {
  const onFinish = (values) => {
    console.log('Success:', values);
  };
  return (
    <Form onFinish={onFinish} autoComplete="off">
      <Form.Item label="Username" name="username">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form.Item>
    </Form>
  );
};
export default App;
```
### 自动安装依赖
可以看到模板中使用了 react 和 antd 这两个第三方依赖，假如使用模板的工程中没有安装这两个依赖，我们要实现在生成模板过程中就**自动安装这两个依赖**。
我们使用**Node 中 child_process 子进程**这个模块来实现。
在 child_process 子进程中的最常用的语法是：
```js
child_process.exec(command, options, callback)
```
- command：命令，比如 pnpm install
- options：参数
  - cwd：设置命令运行环境的路径
  - env：环境变量
  - timeout：运行执行现在

- callback：运行命令结束回调，(error, stdout, stderr) =>{ }，执行成功后 error 为 null，执行失败后 error 为 Error 实例，stdout、stderr 为标准输出、标准错误，其格式默认是字符串。

在 bin 文件夹中新建 manager.js 文件夹，在里面添加如下代码：
```js
const path = require('path');
const { exec } = require('child_process');

const LibraryMap = {
  'Ant Design': 'antd',
  'iView': 'view-ui-plus',
  'Ant Design Vue': 'ant-design-vue',
  'Element': 'element-plus',
}

function install(cmdPath, options) {
  const { frame, library } = options;
  const command = `pnpm add ${frame} && pnpm add ${LibraryMap[library]}`
  return new Promise(function (resolve, reject) {
    exec(
      command,
      {
        cwd: path.resolve(cmdPath),
      },
      function (error, stdout, stderr) {
        console.log('error', error);
        console.log('stdout', stdout);
        console.log('stderr', stderr)
      }
    )
  })
}

exports.install = install;
```
在 install 方法中 exec 的参数 command 是 pnpm 安装依赖命令，安装多个依赖时使用 && 拼接。参数 cwd 是所安装依赖工程的 package.json 文件路径，我们可以使用 process.cwd() 获取。已经在上文提到过，process.cwd() 是当前Node.js 进程执行时的文件所属目录的绝对路径。

接下来使用，在 bin/index.js 修改代码，修改后的代码如下所示：
```js
#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const { inquirerPrompt } = require("./inquirer");
const { copyTemplate, checkMkdirExists } = require("./copy");
const { install } = require('./manager'); // + 添加这行

yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demand: true,
      describe: '模板名称',
      type: 'string'
    })
  },
  function (argv) {
    inquirerPrompt(argv).then(answers => {
      const { name, type } = answers;
      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(),`./src/pages/${name}/index.js`)
      );
      if (isMkdirExists) {
        console.log(`${name}/index.js文件已经存在`)
      } else {
        copyTemplate(
          path.resolve(__dirname, `./template/${type}/index.tpl`),
          path.resolve(process.cwd(), `./src/pages/${name}/index.js`),
          {
            name,
          }
        )
        install(process.cwd(), answers);  // + 添加这行
      }
    })
  }
).argv;
```
当执行完 copyTemplate 方法后，就开始执行 install(process.cwd(), answers) 自动安装模板中所需的依赖。

在 app 文件夹目录下运行 
> pnpm polarizon create -- --name=OrderPage

看能不能自动安装依赖。
等命令执行完成后，观察 examples\app\package.json 文件中的 dependencies 值是不是添加了 antd 和 react 依赖。

![pnpmadd](./asserts/Image11.png)

### ora添加加载动画
此外，我们在执行命令中会发现，光标一直在闪烁，好像卡住了，其中是依赖在安装。这里我们要引入一个加载动画，来解决这个不友好的现象。

这里推荐使用开源库**ora来实现加载动画**。
运行以下命令安装 ora 。
> pnpm add ora@5.4.1 --F polarizon-cli

在 bin/manager.js 修改代码，修改后的代码如下所示：
```js
const path = require('path');
const { exec } = require('child_process');
const ora = require("ora");    // +

const LibraryMap = {
  'Ant Design': 'antd',
  'iView': 'view-ui-plus',
  'Ant Design Vue': 'ant-design-vue',
  'Element': 'element-plus',
}

function install(cmdPath, options) {
  const { frame, library } = options;
  const command = `pnpm add ${frame} && pnpm add ${LibraryMap[library]}`
  return new Promise(function (resolve, reject) {
    const spinner = ora(); // +
    spinner.start(        // +
      `正在安装依赖，请稍等`
    );
    exec(
      command,
      {
        cwd: path.resolve(cmdPath),
      },
      function (error) {
        if (error) {
          reject();
          spinner.fail(`依赖安装失败`);
          return;
        }
        spinner.succeed(`依赖安装成功`);
        resolve()
      }
    )
  })
}

exports.install = install;
```
在 app 文件夹目录下运行 
> pnpm polarizon create -- --name=OrderPage
，看一下执行效果。

![正在安装](./asserts/Image12.png)
![安装完成](./asserts/Image13.png)

## 8、发布和安装
在 packages/polarizon-cli 文件夹目录下运行，运行以下命令安装将脚手架发布到 npm 上。
> pnpm publish --F polarizon-cli

发布成功后。我们在一个任意工程中，执行 pnpm add polarizon-cli -D 安装 polarizon-cli 脚手架依赖成功后，在工程中执行 pnpm polarizon create -- --name=OrderPage 命令即可。
