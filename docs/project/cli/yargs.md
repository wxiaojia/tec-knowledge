关于yargs的部分指南

## 子命令
yargs适合开发复杂的命令行程序的另一个原因是它支持子命令，而且子命令可以嵌套，这意味着你也可以开发出类似git这样拥有上百个命令的程序

yargs的子命令有两种模式：.command(*)和.commandDir(directory, [opts])

### .command
- .command方法有三个接口
- .command(cmd, desc, [builder], [handler])
- .command(cmd, desc, [module])
- .command(module)

其实它们的用法都差不多，可以把它们都看作传递一个module给yargs，这个module必须导出四个变量
cmd, desc [builder], [handler]，其中builder和handler是方法，另外两个是字符串

使用第一个接口的示例
```js
yargs
  .command(
    'get',
    'make a get HTTP request',
    function (yargs) {
      return yargs.option('u', {
        alias: 'url',
        describe: 'the URL to make an HTTP request to'
      })
    },
    function (argv) {
      console.log(argv.url)
    }
  )
  .help()
  .argv
```
使用第三个接口需要把这个模块在单独的文件，然后用require引入

这是模块的代码
```js
// my-module.js
exports.command = 'get <source> [proxy]'

exports.describe = 'make a get HTTP request'

exports.builder = {
  banana: {
    default: 'cool'
  },
  batman: {
    default: 'sad'
  }
}

exports.handler = function (argv) {
  // do something with argv.
}
```
引入的时候这样使用
```js
yargs.command(require('my-module'))
  .help()
  .argv
  ```
当额外的模块没有定义cmd和desc的时候可以使用第二个接口
```js
yargs.command('get <source> [proxy]', 'make a get HTTP request', require('my-module'))
  .help()
  .argv
```

这里建议使用第三个接口，这样能保持模块的内聚，这种模块你能挂载在任何命令下面，迁移的时候不需要修改模块代码，只需要修改引入模块的代码就能实现

这段代码使用了 yargs 库来定义一个命令，命令名称为 get，带有两个参数：source 和可选的 proxy 参数。

- source：这是一个必选参数，它表示你在执行命令时需要提供的源参数，比如文件名、URL 等等。
- [proxy]：这是一个可选参数，用中括号 [] 括起来表示。这意味着在执行命令时可以选择性地提供代理参数，如果不提供则使用默认值或者不使用代理。

这个命令的语法规则是 yargs 的一部分，它允许你在命令行中执行类似 get 命令，并且提供相应的参数。例如：

> node your-script.js get myfile.txt

在这个例子中，source 参数的值为 myfile.txt，而 proxy 参数没有提供，因为它是可选的。

> node your-script.js get myfile.txt http://example.com

在这个例子中，source 参数的值为 myfile.txt，而 proxy 参数的值为 http://example.com，因为它是可选的并且提供了。