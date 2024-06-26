### Workspace 工作区
包管理工具通过 workspace 功能来支持 Monorepo 模式。Workspace 是指在一个代码库中管理多个相关项目或模块的能力。

不管是 npm workspace、yarn workspace 还是 pnpm workspace，**都能达到在 npm install 的时候自动 link 的目的。**

### 包管理工具通过以下方式实现 workspace 的支持：

1. 代码结构组织：在 Monorepo 中，不同的项目或模块通常位于同一个代码库的不同目录中。包管理工具通过识别并管理这些目录结构，可以将它们作为独立的项目或模块进行操作。
2. 共享依赖：Monorepo 中的不同项目或模块可以共享相同的依赖项。包管理工具可以通过在根目录中维护一个共享的依赖项列表，以确保这些依赖项在所有项目或模块中都可用。
3. 交叉引用：在 Monorepo 中，不同项目或模块之间可能存在相互引用的情况。包管理工具需要处理这些交叉引用，以确保正确解析和构建项目之间的依赖关系。
4. 版本管理：Monorepo 中的不同项目或模块可能具有不同的版本。包管理工具需要能够管理和跟踪这些版本，并确保正确地安装和使用适当的版本。
5. 构建和测试：包管理工具需要支持在 Monorepo 中进行增量构建和测试。这意味着只有发生更改的项目或模块会重新构建和测试，而不需要重新构建和测试整个代码库。

前端目前最主流的三款包管理工具 npm7+、yarn、pnpm 都已经原生支持 workspace 模式，也就是说不管使用哪个包管理工具，我们都可以实现其与 monorepo 的配合，但最终依然选择 pmpm 作为包管理工具主要是由于 pnpm 很好的解决了 npm 与 yarn 遗留的历史问题。

### npm 与 yarn 的历史遗留问题
- 扁平化依赖算法复杂，需要消耗较多的性能，依赖串行安装还有提速空间。
- 大量文件需要重复下载，对磁盘空间的利用率不足。（虽然在同一个项目中我不会重复的安装依赖 d 了，但是如果我有100个项目，100个项目都需要用到某个包，那么这个包依然会被下载100次，也就是在磁盘的不同地方写入100次）
- 扁平化依赖虽然解决了不少问题，但是随即带来了依赖非法访问的问题，项目代码在某些情况下可以在代码中使用没有被定义在 package.json 中的包，这种情况就是我们常说的幽灵依赖。


### pnpm怎么解决问题
- 会先分析依赖树，决定要下载那些安装包。
- 使用硬连接的方式节约磁盘空间利用率、采用虚拟存储目录+软连接解决幽灵依赖

硬链接&软连接
硬链接： 电脑文件系统中的多个文件平等的共享同一个文件存储单元。
假如磁盘中有一个名为 data 的数据，C盘中的一个名为 hardlink1 的文件硬链接到磁盘 data 数据，另一个名为 hardlink2 的文件也硬链接到磁盘 data 数据，此时如果通过 hardlink1 文件改变磁盘 data 的数据内容，则通过 hardlink2 访问磁盘 data 数据内容是改变过后的内容。
硬链接可以有多条，它们可以指向同一块磁盘空间。

软链接（符号连接）： 包含一条以绝对路径或相对路径的形式指向其他文件或者目录的引用。

最常见的就是桌面的快捷方式，其本质就是一个软链接，软链接所产生的文件是无法更改的，它只是存储了目标文件的路径，并根据该路径去访问对应的文件。

