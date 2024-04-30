## Prettier 和 ESLint 
Prettier 和 ESLint 是两种不同的工具，虽然它们都与代码风格和质量有关，但在功能和工作原理上有一些区别。

Prettier：
Prettier 是一个代码格式化工具，它的目标是强制执行一致的代码格式，而不是仅仅发现代码中的问题。它会完全重写代码，使其符合指定的代码风格。
Prettier 会自动调整代码的缩进、换行符、引号样式等，以确保整个项目的代码风格一致，并且不需要手动配置大量的规则。
Prettier 不会执行任何语法检查，例如变量未使用或者未定义等问题，它只负责格式化代码。
ESLint：
ESLint 是一个代码检查工具，它的目标是找出代码中的问题，并提供警告或错误消息来指出潜在的错误或不符合规范的代码。
ESLint 可以根据预定义的规则集或自定义规则集来检查代码，它可以检测到各种问题，例如未使用的变量、潜在的语法错误、不建议使用的语言特性等。
ESLint 可以与 Prettier 结合使用，以便在格式化代码的同时执行代码检查。这样，你就可以获得 Prettier 提供的一致的代码风格，同时也可以使用 ESLint 检查代码质量和规范性。
综上所述，Prettier 专注于代码格式化，而 ESLint 专注于代码质量和规范性检查。在实际项目中，通常会将二者结合使用，以确保代码既具有一致的格式，又符合规范并且没有潜在的问题。

## 安装
安装 Prettier 和 ESLint：首先，确保你的项目中已经安装了 Prettier 和 ESLint。使用 npm 安装：
css
Copy code
npm install --save-dev prettier eslint
或者使用 yarn 安装：

> yarn add --dev prettier eslint
安装 ESLint 插件：安装 ESLint 的 Prettier 插件，这样 ESLint 就能够理解 Prettier 的格式化规则，并相应地检查代码。使用 npm 安装：

> npm install --save-dev eslint-plugin-prettier

或者使用 yarn 安装：

> yarn add --dev eslint-plugin-prettier

配置 ESLint：在项目根目录下创建一个 .eslintrc.json 或 .eslintrc.js 文件，并添加以下配置：
```json
{
  "extends": ["eslint:recommended", "plugin:prettier/recommended"]
}
```
这将使用 ESLint 推荐的规则，并集成 Prettier 的格式化规则。
创建 Prettier 配置文件（可选）：在项目根目录下创建一个 .prettierrc 文件，并根据你的偏好配置 Prettier 的选项。例如：
```json
{
  "tabWidth": 2,
  "singleQuote": true
}
```
集成到编辑器中：安装并配置你喜欢的编辑器插件，以便在保存文件时自动运行 ESLint 和 Prettier。大多数主流编辑器都有相应的插件，例如 VS Code 中的 "ESLint" 和 "Prettier" 插件。
运行代码检查：现在，你可以在项目中运行 ESLint 来检查代码并在需要时自动修复格式化错误。使用 npm 运行：
> npx eslint .

或者使用 yarn 运行：

> yarn eslint .


## eslint 的一些报错
1）报错： conld not find config file
解决：报错是9以上的版本，将eslint版本改为8.42.0 就可以了

2）Parsing error: The keyword 'import' is reserved error  
Parsing error: The keyword 'export' is reserved
解决：启动对es6的支持，添加：
```json
{
  "parserOptions": {
    "ecmaVersion": 6
  }
}
```
或使用解析器
```js
{
  "parser": "babel-eslint"
}
```

3)  error: 'import' and 'export' may appear only with 'sourceType: module'
检查 ESLint 配置文件中的解析器选项：打开你的 ESLint 配置文件（如 .eslintrc.json 或 .eslintrc.js），确保配置了正确的解析器选项。例如，在 .eslintrc.json 文件中配置解析器选项为 babel-eslint 或 @babel/eslint-parser：
```json
{
  "parser": "babel-eslint"
}
```
或者，如果你正在使用 ESLint 7.0 及更高版本，可以在 parserOptions 中配置 sourceType 选项为 "module"，来表示你的代码是 ES6 模块：
```json
{
  "parserOptions": {
    "sourceType": "module"
  }
}
```

4) 'exec' is defined but never used  no-unused-vars
解决：1、在代码中删除无用的代码，
2 或者修改eslint配置： 添加规则：忽略
```js
{
  "rules": {
    "no-unused-vars": "off"
  }
}
```

5) 格式化时，右括号会报错：
原因：括号中最后一个参数加了逗号
解决： prettier中添加 "trailingComma": "none"
文档：
"all": 总是在对象字面量和数组字面量的最后一个元素后面添加逗号。
"es5": 在 ES5 中，只在对象字面量和数组字面量的最后一个元素后面添加逗号。
"none": 不在对象字面量和数组字面量的最后一个元素后面添加逗号。

6)  error  Parsing error: Unexpected token =>
 ```json
 "parserOptions": {
    "ecmaVersion": 8    // 指定ECMAScript版本
 }
 ```

7)  error  Parsing error: Unexpected token ..
 ecmaVersion 升级为9

8)  error  Parsing error: Unexpected token import
 ecmaVersion 升级为 10

9) 使用4个空格而不用制表符：
 useTabs: false,

10) 数组对象最后一个逗号 eslint prettier冲突
.prettier
```json
{
  "trailingComma": "none"
}
```
.eslintrc.
```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```
若无效，重启下编辑器

## prettier的一些配置
```js
module.exports = {
    // 超过最大值换行
    printWidth: 130,
    // 缩进字节数
    tabWidth: 4,
    // 使用制表符而不是空格缩进行
    useTabs: true,
    // 结尾不用分号(true有，false没有)
    semi: false,
    // 使用单引号(true单双引号，false双引号)
    singleQuote: true,
    // 更改引用对象属性的时间 可选值"<as-needed|consistent|preserve>"
    quoteProps: 'as-needed',
    // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
    bracketSpacing: true,
    // 多行时尽可能打印尾随逗号。（例如，单行数组永远不会出现逗号结尾。） 可选值"<none|es5|all>"，默认none
    trailingComma: 'none',
    // 在JSX中使用单引号而不是双引号
    jsxSingleQuote: false,
    //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号 ,always：不省略括号
    arrowParens: 'avoid',
    // 如果文件顶部已经有一个 doclock，这个选项将新建一行注释，并打上@format标记。
    insertPragma: false,
    // 指定要使用的解析器，不需要写文件开头的 @prettier
    requirePragma: false,
    // 默认值。因为使用了一些折行敏感型的渲染器（如GitHub comment）而按照markdown文本样式进行折行
    proseWrap: 'preserve',
    // 在html中空格是否是敏感的 "css" - 遵守CSS显示属性的默认值， "strict" - 空格被认为是敏感的 ，"ignore" - 空格被认为是不敏感的
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
    endOfLine: 'auto',
    // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
    rangeStart: 0,
    rangeEnd: Infinity,
    // Vue文件脚本和样式标签缩进
    vueIndentScriptAndStyle: false
}
```

## 其他配置
```json
{
    // vscode默认启用了根据文件类型自动设置tabsize的选项
   "editor.detectIndentation": false,
   // 重新设定tabsize
   "editor.tabSize": 2,
   // #每次保存的时候自动格式化 
   "editor.formatOnSave": true,
   // #每次保存的时候将代码按eslint格式进行修复
   "eslint.autoFixOnSave": true,
   // 添加 vue 支持
   "eslint.validate": [
       "javascript",
       "javascriptreact",
       {
           "language": "vue",
           "autoFix": true
       }
   ],
   //  #让prettier使用eslint的代码格式进行校验 
   "prettier.eslintIntegration": true,
   //  #去掉代码结尾的分号 
   "prettier.semi": false,
   //  #使用带引号替代双引号 
   "prettier.singleQuote": true,
   //  #让函数(名)和后面的括号之间加个空格
   "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
   // #这个按用户自身习惯选择 
   "vetur.format.defaultFormatter.html": "js-beautify-html",
   // #让vue中的js按编辑器自带的ts格式进行格式化 
   "vetur.format.defaultFormatter.js": "vscode-typescript",
   "vetur.format.defaultFormatterOptions": {
       "js-beautify-html": {
           "wrap_attributes": "force-aligned"
           // #vue组件中html代码格式化样式
       }
   },
   // 格式化stylus, 需安装Manta's Stylus Supremacy插件
   "stylusSupremacy.insertColons": false, // 是否插入冒号
   "stylusSupremacy.insertSemicolons": false, // 是否插入分好
   "stylusSupremacy.insertBraces": false, // 是否插入大括号
   "stylusSupremacy.insertNewLineAroundImports": false, // import之后是否换行
   "stylusSupremacy.insertNewLineAroundBlocks": false // 两个选择器中是否换行
}
```


## 更多的配置：
https://xuoutput.github.io/2019/02/20/prettier%E4%BB%A3%E7%A0%81%E6%A0%BC%E5%BC%8F%E7%BE%8E%E5%8C%96/

https://juejin.cn/post/7051486506946396174