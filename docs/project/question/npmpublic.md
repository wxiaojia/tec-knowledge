## npm public是遇到问题
如果我发布的不是main分支，会一直提示：
You're on branch "dev" but your "publish-branch" is set to "master|main". Do you want to continue? (false)

解决：
第一种，发布命令时 加上yes: npm publish --yes
第二种，更改发布分支配置：在 .npmrc文件中添加：publish-branch=dev