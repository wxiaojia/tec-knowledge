## 项目中安装babel 
要向项目添加 Babel，你需要执行以下步骤：

安装 Babel：首先，你需要在项目中安装 Babel 及其相关的包。你可以使用 npm 或者 yarn 来完成这一步骤。使用 npm：

> npm install --save-dev @babel/core @babel/cli @babel/preset-env
或者使用 yarn：

> yarn add --dev @babel/core @babel/cli @babel/preset-env

创建 Babel 配置文件：在项目的根目录下创建一个名为 .babelrc 的文件，并配置 Babel 的预设。在这个文件中，你可以指定 Babel 应该如何转换代码。例如，你可以指定使用 @babel/preset-env 预设来根据目标环境自动转换你的代码。.babelrc 文件内容示例：
```json
{
  "presets": ["@babel/preset-env"]
}
```
使用 Babel 转换代码：现在，你可以使用 Babel 来转换你的 JavaScript 代码了。你可以在命令行中使用 babel 命令，或者在构建工具（如 Webpack）中配置 Babel。在命令行中使用 Babel：

> npx babel src --out-dir dist

这会将 src 目录中的代码转换并输出到 dist 目录。
集成到构建工具中：如果你使用的是构建工具，如 Webpack，你可以配置它来使用 Babel。在 Webpack 的配置文件中添加 Babel 的 loader，以便在构建过程中自动转换你的代码。Webpack 配置示例：
```js
module.exports = {
  // 其他配置...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### 排除某个目录
使用 .babelrc 文件：在项目的根目录下创建一个名为 .babelrc 的文件，用来配置 Babel。如果你尚未创建 .babelrc 文件，你可以创建一个新文件，并添加以下内容：
```json
{
  "ignore": ["path/to/excluded/directory"]
}
```

将 "path/to/excluded/directory" 替换为你想要排除的目录的路径。这样，Babel 将忽略该目录下的所有文件。
使用 babel.config.js 文件（适用于 Babel 7+）：如果你更喜欢使用 JavaScript 来配置 Babel，你可以创建一个名为 babel.config.js 的文件，并添加以下内容：
```javascript
module.exports = {
  ignore: ["path/to/excluded/directory"]
};
```
同样地，将 "path/to/excluded/directory" 替换为你想要排除的目录的路径。
通过以上配置，Babel 将忽略指定目录下的所有文件，不会对其进行转义。这样，你就可以在 Babel 转义过程中排除特定目录。