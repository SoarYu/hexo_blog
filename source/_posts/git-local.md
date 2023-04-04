---
title: git 代码管理
date: 2022-07-06 22:16:00
description: 将本地代码推送到新仓库
categories: 
 - Deploy相关
---
在github新建仓库获取https://*.git

```bash
git clone https://*.git

git init

git remote add origin https://*.git

git add Readme.md

git commit -m "update Readme.md"

git push -u origin master
```



