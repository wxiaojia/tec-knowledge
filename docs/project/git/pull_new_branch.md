
假设你在dev分支上,想pull线上的 test分支(你不知道分支名字)

git branch -r (这一步你可以看到代码仓库中所有的分支, 得到 test名字)
git checkout -b test origin/test (在本地创建已线上test分支为基础的分支)
git checkout test (切换到刚才创建的分支)