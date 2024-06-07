## git 如何获取指定 tag 代码
1、查看本地git仓库下的tag
    git tag

2、若本地没有仓库代码，可以选择拉去
    git clone git@xxx.xxx:/progject.git

3、切换到某一个tag下
    git checkout tag_name

## 如果需要修改tag代码：
当前处于一个“detached HEAD” 状态 ,每一个 tag 就是代码仓库中的一个快照，如果你想编辑此tag 下的代码,上面的方法就不适用了.你需要把 tag 快照对应的代码拉取到一个分支上。
例如想编辑 v1.0的tag 代码，那么可以选择如下操作
```js
    git checkout -b new_branch v1.0
    git checkout -b [分支名称] [tag标签名称]
```