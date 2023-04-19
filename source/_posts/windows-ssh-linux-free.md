---
title: Windows 配置 ssh 免密登录
date: 2023-03-23 16:00:00
description: 一键ssh登录配置
categories:
 - Docker
---


## 一、Windows生成密钥

1. Windows 打开 cmd
2. 输入：
```bash
ssh-keygen -t rsa
```

3. 连续回车就 OK
4. 完成后会在用户目录下的**.ssh**目录下生成公钥和私钥
- id_rsa：私钥
- id_rsa.pub：公钥
## 二、将Windows公钥上传到Linux服务器
**在Linux 打开终端**
```bash
cd ~
# 输入 ssh-keygen 回车（生成虚拟机的公私钥）
ssh-keygen

# 进入ssh目录 cd .ssh
cd ~/.ssh
# 将 Windows 电脑 id_rsa.pub里的文本，拷贝到虚拟机 authorized_keys 里
vim authorized_keys
```

## 三、在Windows中免密SSH登录Linux
```bash
ssh root@ip
```

## 四、通过 ssh 上传与下载文件
```bash
# 本地复制远程文件：（把远程的文件复制到本地）
scp root@192.168.1.101:/val/test/test.tar.gz /val/test/test.tar.gz

# 远程复制本地文件：（把本地的文件复制到远程主机上）
scp /val/test.tar.gz root@192.168.1.101:/val/test.tar.gz

# 本地复制远程目录：（把远程的目录复制到本地）
scp -r root@192.168.1.101:/val/test/ /val/test/

# 远程复制本地目录：（把本地的目录复制到远程主机上）
scp -r ./ubuntu_env/ root@192.168.1.101:/home/aowei

# 本地复制远程文件到指定目录：（把远程的文件复制到本地）
scp root@192.168.1.101:/val/test/test.tar.gz /val/test/

# 远程复制本地文件到指定目录：（把本地的文件复制到远程主机上）
scp /val/test.tar.gz root@192.168.1.101:/val/
```

参考链接
[https://blog.csdn.net/qq_43901693/article/details/103700272](https://blog.csdn.net/qq_43901693/article/details/103700272)
