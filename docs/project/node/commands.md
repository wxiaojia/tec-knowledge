## 执行系统命令 与系统的交互
child_process模块了，这个模块翻译过来就是子进程，这个模块主要是通过产生子进程来发挥作用
### 一、exec与execSync
  这是child_process模块里面最简单的函数，作用就是执行一个固定的系统命令
```js
const { exec } = require('child_process');
// 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
exec('ls -l', (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
})
```
  exec函数第一个参数是要执行的命令，的第二个函数是配置选项，第三个参数是回调函数，第二个参数中一个比较常用的就是子进程的工作目录
```js
const { exec } = require('child_process');
const path = require('path'):
// 在当前目录下的scripts文件夹里执行hexo g命令
exec('hexo g', { cwd: path.join(process.cwd(), 'scripts') }, (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
```
  execSync是exec的同步版本，不过无论是execSync还是exec，得到的结果都是字符串或者Buffer对象，一般需要进一步处理。

请参考：exec具体配置，execSync具体配置

二、execFile与execFileSync
  这两个函数的作用是执行一个可执行文件，看下面的实例：
```js
const { execFile, execFileSync } = require('child_process');

execFile('example.py', [], (err, stdout, stderr) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

const stdout = execFileSync('node', ['-v']);
console.log(stdout);
```
  跟exec类似，第一个参数是要执行的文件路径，第二个是参数数组，第三个是配置，第四个是回调函数，当然，除了第一个之外都是可以省略的

注意：被执行的文件一定要有可执行权限，如果是类似.py类的特定语言的脚本，一定在开头指定解释器程序路径


请参考：execFile配置，execFileSync配置

三、spawn与spawnSync
  child_process模块中所有函数都是基于spawn和spawnSync函数的来实现的，换句话来说，spawn和spawnSync函数的配置是最完全的，其它函数都是对其做了封装和修改。下面我们来重点讲解一下：
  spawn函数原型是这样的：child_process.spawn(command[, args][, options])
  它使用指定的命令行参数创建新进程，spawn 会返回一个带有stdout和stderr流的对象。你可以通过stdout流来读取子进程返回给Node.js的数据。stdout拥有'data','end'以及一般流所具有的事件。当你想要子进程返回大量数据给Node时，比如说图像处理，读取二进制数据等等，你最好使用spawn方法
```js
const {spawn}  = require('child_process');
const fs = require('fs');
const spawnObj = spawn('ping', ['127.0.0.1'], {encoding: 'utf-8'});
spawnObj.stdout.on('data', function(chunk) {
    console.log(chunk.toString());
});
spawnObj.stderr.on('data', (data) => {
  console.log(data);
});
spawnObj.on('close', function(code) {
    console.log('close code : ' + code);
})
spawnObj.on('exit', (code) => {
    console.log('exit code : ' + code);
    fs.close(fd, function(err) {
        if(err) {
            console.error(err);
        }
    });
});
```