---
title: K3S 集群部署学习记录
date: 2023-01-06 13:32:43
description: 基于kubernetes V1.25版本。从V1.24开始，kubernetes默认容器运行时使用containerd，不再使用docker。
categories: 
 - 云原生
---


## 一、K3S 集群部署
```bash
#  关闭防火墙
#  设置selinux(需要联网)
systemctl disable firewalld --now
yum install -y container-selinux selinux-policy-base
yum install -y https://rpm.rancher.io/k3s/latest/common/centos/7/noarch/k3s-selinux-0.2-1.el7_8.noarch.rpm
```
```bash
# 将k3s二进制文件移动到/usr/local/bin目录，并添加执行权限
mv k3s /usr/local/bin
chmod +x /usr/local/bin/k3s

# 将镜像移动到/var/lib/rancher/k3s/agent/images/目录（无需解压）
mkdir -p /var/lib/rancher/k3s/agent/images/
cp ./k3s-airgap-images-amd64.tar.gz /var/lib/rancher/k3s/agent/images/

# 在k8s-master节点执行：
#修改权限
chmod +x install.sh
#离线安装
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
#安装完成后，查看节点状态
kubectl get node
#查看token
cat /var/lib/rancher/k3s/server/node-token
#K103b3dfdad0ab6fe42a55a30b7873ac52baecbd27189fe27673b4c08358ef26231::server:de73b527ff36592ac954c7bed67215e0

#K103b3dfdad0ab6fe42a55a30b7873ac52baecbd27189fe27673b4c08358ef26231::server:de73b527ff36592ac954c7bed67215e0

#在k8s-worker1和k8s-worker2节点执行
INSTALL_K3S_SKIP_DOWNLOAD=true \
K3S_URL=https://192.168.66.52:6443 \
K3S_TOKEN=K103b3dfdad0ab6fe42a55a30b7873ac52baecbd27189fe27673b4c08358ef26231::server:de73b527ff36592ac954c7bed67215e0 \
./install.sh

```
### 运行环境

- 最低运行要求
   - 内存: 512MB   /   CPU: 1 核心
- K3s版本：**v1.25.0+k3s1**
- 集群规划
| 主机名 | IP地址 | 配置 | 系统 | 网络 |
| --- | --- | --- | --- | --- |
| k8s - master | 192.168.66.52 | 内存：4G
CPU：4核(8逻辑核心)
硬盘：20G | ubuntu20.04 | vmware
bridge模式 |
| k8s-worker1 | 192.168.66.53 |  |  |  |
| k8s-worker2 | 192.168.66.54 |  |  |  |

### 1.准备工作
需要在每台机器上执行如下命令：

   - 关闭防火墙
   - 设置selinux(需要联网): 安全增强型 Linux（Security-Enhanced Linux）简称 SELinux，它是一个 Linux 内核模块，也是 Linux 的一个安全子系统。SELinux 主要作用就是最大限度地减小系统中服务进程可访问的资源（最小权限原则）。[https://www.cnblogs.com/call-me-dasheng/p/15888546.html](https://www.cnblogs.com/call-me-dasheng/p/15888546.html)
```bash
sudo ufw disable
```
```bash
yum install -y container-selinux selinux-policy-base
yum install -y https://rpm.rancher.io/k3s/latest/common/centos/7/noarch/k3s-selinux-0.2-1.el7_8.noarch.rpm
```
### 2.下载安装包
下载安装脚本`**install.sh**`：[https://get.k3s.io/](https://get.k3s.io/)
下载`**k3s**`二进制文件：[k3s](https://github.com/k3s-io/k3s/releases/download/v1.25.0%2Bk3s1/k3s)
下载必要的**image**：[离线安装需要的image文件](https://github.com/k3s-io/k3s/releases/download/v1.25.0%2Bk3s1/k3s-airgap-images-amd64.tar.gz)
> 这些文件都可以在github仓库中获取：[https://github.com/k3s-io/k3s](https://github.com/k3s-io/k3s)

### 3.执行安装脚本

1. 将k3s二进制文件移动到/usr/local/bin目录，并添加执行权限
```bash
mv k3s /usr/local/bin
chmod +x /usr/local/bin/k3s
```

2. 将镜像移动到/var/lib/rancher/k3s/agent/images/目录（无需解压）
```bash
mkdir -p /var/lib/rancher/k3s/agent/images/
cp ./k3s-airgap-images-amd64.tar.gz /var/lib/rancher/k3s/agent/images/
```

- 在k8s-master节点执行：
```bash
#修改权限
chmod +x install.sh
#离线安装
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
#安装完成后，查看节点状态
kubectl get node
#查看token
cat /var/lib/rancher/k3s/server/node-token
#K106e06c1493d4fc3b4941c85d6dbfdaf7140a7e660ca8b6f849f89ff480c4ed418::server:5af23e94c7de63baa6372e9c1ba58e3c
```

- 在k8s-worker1和k8s-worker2节点执行
```bash
INSTALL_K3S_SKIP_DOWNLOAD=true \
K3S_URL=https://192.168.66.52:6443 \
K3S_TOKEN=K106e06c1493d4fc3b4941c85d6dbfdaf7140a7e660ca8b6f849f89ff480c4ed418::server:5af23e94c7de63baa6372e9c1ba58e3c \
./install.sh
```

### 虚拟网卡 cni0
k8s内部的虚拟网络：
master
```bash
cni0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        inet 10.42.0.1  netmask 255.255.255.0  broadcast 10.42.0.255
        inet6 fe80::2482:52ff:fec9:2e8c  prefixlen 64  scopeid 0x20<link>
        ether 26:82:52:c9:2e:8c  txqueuelen 1000  (Ethernet)
        RX packets 157038  bytes 33121066 (31.5 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 188136  bytes 33822037 (32.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
slave1
```bash
cni0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        inet 10.42.1.1  netmask 255.255.255.0  broadcast 10.42.1.255
        inet6 fe80::b89d:9cff:fefd:13fe  prefixlen 64  scopeid 0x20<link>
        ether ba:9d:9c:fd:13:fe  txqueuelen 1000  (Ethernet)
        RX packets 7  bytes 472 (472.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 986  bytes 174561 (170.4 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
slave2
```bash
cni0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        inet 10.42.2.1  netmask 255.255.255.0  broadcast 10.42.2.255
        inet6 fe80::44e5:b5ff:fe98:cc35  prefixlen 64  scopeid 0x20<link>
        ether 46:e5:b5:98:cc:35  txqueuelen 1000  (Ethernet)
        RX packets 35  bytes 3770 (3.6 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4067  bytes 1530154 (1.4 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
### 排查错误
如果安装或启动不成功，可能有以下几个原因：

1. 时间不统一
2. IP有冲突，请为每个主机分配不同的IP
3. 主机名(hostname)重复，请为每个主机设置不同的主机名
4. 网卡的MAC有冲突，复制虚拟机时，请为所有网卡重新生产MAC地址

      

参考文档：
[https://k3s.io/](https://k3s.io/)
[https://rancher.com/docs/k3s/latest/en/](https://rancher.com/docs/k3s/latest/en/)
[https://rancher.com/docs/k3s/latest/en/quick-start/](https://rancher.com/docs/k3s/latest/en/quick-start/)
[https://rancher.com/docs/k3s/latest/en/installation/airgap/](https://rancher.com/docs/k3s/latest/en/installation/airgap/)

## 二、镜像加速
由于kubernetes从`V1.24`版本开始默认使用`**containerd**`作为容器服务，需要修改`**containerd**`的配置文件，才能让Pod的镜像使用镜像加速器。
配置文件路径一般为`**/etc/containerd/config.toml**`，详见[阿里云镜像加速](https://help.aliyun.com/document_detail/60750.html)。
#### 在K3s中配置镜像仓库
K3s 会自动生成containerd的配置文件**/var/lib/rancher/k3s/agent/etc/containerd/config.toml**,不要直接修改这个文件，k3s重启后修改会丢失。
为了简化配置，K3s 通过**/etc/rancher/k3s/registries.yaml**文件来配置镜像仓库，K3s会在启动时检查这个文件是否存在。
我们需要在每个节点上新建/etc/rancher/k3s/registries.yaml文件，配置内容如下：
```yaml
mirrors:
  docker.io:
    endpoint:
      - "https://fsp2sfpr.mirror.aliyuncs.com/"
```
重启每个节点
```bash
systemctl restart k3s
systemctl restart k3s-agent
```
查看配置是否生效。
```bash
cat /var/lib/rancher/k3s/agent/etc/containerd/config.toml
```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/28915315/1664114191862-6dfeb893-b80d-4d71-b2a1-6862b68b22b1.png#averageHue=%23071a1f&clientId=uca5f7f44-ddce-4&errorMessage=unknown%20error&from=paste&height=560&id=ued1f7420&name=image.png&originHeight=1120&originWidth=1740&originalType=binary&ratio=1&rotation=0&showTitle=false&size=164307&status=error&style=none&taskId=ueaed5979-f365-4f38-9f24-3688965f700&title=&width=870)
## 三、创建和管理Pod
```bash
# 创建一个pod：mynginx, 使用镜像nginx
kubectl run mynginx --image=nginx:1.22
# 查看Pod
kubectl get pod
# 描述
kubectl describe pod mynginx
# 查看Pod的运行日志
kubectl logs mynginx

# 显示pod的IP和运行节点信息
kubectl get pod -owide
# 使用Pod的ip+pod里面运行容器的端口
curl 10.42.1.3

#进入内部，在容器中执行bash
kubectl exec mynginx -it -- /bin/bash

kubectl get po --watch
# -it 交互模式 
# --rm 退出后删除容器，多用于执行一次性任务或使用客户端
kubectl run mynginx --image=nginx -it --rm -- /bin/bash 
kubectl run my-busybox --image=busybox -it --rm 

# 删除
kubectl delete pod mynginx
# 强制删除
kubectl delete pod mynginx --force
```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/28915315/1663814727899-c31f2117-d540-48fc-93dc-e004dbf1abfb.png#averageHue=%230c1e24&clientId=u8b252c4c-2ccb-4&errorMessage=unknown%20error&from=paste&height=68&id=u1c6f8676&name=image.png&originHeight=136&originWidth=1744&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25497&status=error&style=none&taskId=ue22858f7-27a3-4ce9-b8a5-b11163e70ae&title=&width=872)
## 创建管理Deployment(部署)与ReplicaSet(副本集)
**Deployment**是对ReplicaSet和Pod更高级的抽象。
它使Pod拥有多副本，自愈，扩缩容、滚动升级等能力。

**ReplicaSet**(副本集)是一个Pod的集合。
它可以设置运行Pod的数量，确保任何时间都有指定数量的 Pod 副本在运行。
通常我们不直接使用ReplicaSet，而是在Deployment中声明。
### 创建deployment和replicaset
```bash
#创建deployment,部署3个运行nginx的Pod
[root@k3s-master52 ~]# kubectl create deployment nginx-deploy --image=nginx:1.22 --replicas=3
deployment.apps/nginx-deploy created

[root@k3s-master52 ~]# kubectl get pod
NAME                            READY   STATUS              RESTARTS   AGE
nginx-deploy-855866bb46-xnqzf   0/1     ContainerCreating   0          29s
nginx-deploy-855866bb46-clg2r   0/1     ContainerCreating   0          29s
nginx-deploy-855866bb46-s2zqc   1/1     Running             0          29s

# 查看deployment
[root@k3s-master52 ~]# kubectl get deploy
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deploy   3/3     3            3           3m6s

# 查看replicaSet
[root@k3s-master52 ~]# kubectl get replicaset
NAME                      DESIRED   CURRENT   READY   AGE
nginx-deploy-855866bb46   3         3         3       3m17s


```
### Pod自愈功能
```bash
# 删除其中一个pod
[root@k3s-master52 ~]# kubectl delete pod nginx-deploy-855866bb46-s2zqc
pod "nginx-deploy-855866bb46-s2zqc" deleted

# 很快补全副本集里的pod，实现自愈功能
[root@k3s-master52 ~]# kubectl get pod
NAME                            READY   STATUS    RESTARTS   AGE
nginx-deploy-855866bb46-xnqzf   1/1     Running   0          5m59s
nginx-deploy-855866bb46-clg2r   1/1     Running   0          5m59s
nginx-deploy-855866bb46-8rdbn   1/1     Running   0          118s

```
### Pod缩放功能

- 手动缩放
```bash
#将副本数量调整为5
kubectl scale deployment/nginx-deployment --replicas=5
kubectl get deploy

[root@k3s-master52 ~]# kubectl get replicaset --watch
NAME                      DESIRED   CURRENT   READY   AGE
nginx-deploy-855866bb46   5         5         5       23m
nginx-deploy-855866bb46   3         5         5       23m
nginx-deploy-855866bb46   3         5         5       23m
nginx-deploy-855866bb46   3         3         3       23m
nginx-deploy-855866bb46   5         3         3       23m
```

- 自动缩放

自动缩放通过增加和减少副本的数量，以保持所有 Pod 的平均 CPU 利用率不超过 75%。
自动伸缩需要声明Pod的资源限制，同时使用 [Metrics Server](https://github.com/kubernetes-sigs/metrics-server#readme) 服务（K3s默认已安装）。
> 本例仅用来说明`kubectl autoscale`命令的使用，完整示例参考：[HPA演示](https://kubernetes.io/zh-cn/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)

```bash
#自动缩放
kubectl autoscale deployment/nginx-auto --min=3 --max=10 --cpu-percent=75 
#查看自动缩放
kubectl get hpa
#删除自动缩放
kubectl delete hpa nginx-deployment
```

### 滚动更新
```bash
#查看版本和Pod
kubectl get deployment/nginx-deployment -owide
kubectl get pods

#更新容器镜像
kubectl set image deployment/nginx-deployment nginx=nginx:1.23
#滚动更新
kubectl rollout status deployment/nginx-deployment
#查看过程
kubectl get rs --watch
```
### 版本回滚
```bash
#查看历史版本
kubectl rollout history deployment/nginx-deployment
#查看指定版本的信息
kubectl rollout history deployment/nginx-deployment --revision=2
#回滚到历史版本
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

## 五、Service 服务

- Service将运行在一组 [Pods](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/) 上的应用程序公开为网络服务的抽象方法。
- Service为一组 Pod 提供相同的 DNS 域名，并且在它们之间进行负载均衡。
- 服务发现：Kubernetes 为 Pod 提供分配了IP 地址，但IP地址可能会发生变化。集群内的容器可以通过service名称访问服务，而不需要担心Pod的IP发生变化。

Kubernetes Service 定义了这样一种抽象：
逻辑上的一组可以互相替换的 Pod，通常称为微服务。 
Service 对应的 Pod集合 通常是通过[选择算符](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)来确定的。 
举个例子，在一个Service中运行了3个nginx的副本。这些副本是可互换的，我们不需要关心它们调用了哪个nginx，也不需要关注 Pod的运行状态，只需要调用这个服务就可以了。
### 创建与访问Service对象
**创建Service时根据type取值不同，服务暴露的方式和范围不同**
●ClusterIP：将服务公开在集群内部。kubernetes会给服务分配一个集群内部的 IP，集群内的所有主机都可以通过这个Cluster-IP访问服务。集群内部的Pod可以通过service名称访问服务。
●[NodePort](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#type-nodeport)：通过每个节点的主机IP 和静态端口（NodePort）暴露服务。 集群的外部主机可以使用节点IP和NodePort访问服务。
●[ExternalName](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#externalname)：将集群外部的网络引入集群内部。
●[LoadBalancer](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#loadbalancer)：使用云提供商的负载均衡器向外部暴露服务。 

**ClusterIP**
集群内的所有主机都可以通过这个Cluster-IP访问服务。集群内部的Pod可以通过service名称访问服务。
```bash
# 创建服务， 指定deploy为作为提供服务的抽象，port为pod端口，
kubectl expose deploy/nginx-deploy --name=nginx-service --port=8080 --target-port=80

# 集群内访问服务
kubectl get service
curl 10.43.13.226:8080

#容器内访问
kubectl run nginx-test --image=nginx:1.22 -it --rm -- sh
curl nginx-service:8080
```

**NodePort**
每个节点的主机IP 和静态端口（NodePort）暴露服务。 集群的外部主机可以使用节点IP和NodePort访问服务。
1.NodePort端口是随机的，范围为:30000-32767。
2.集群中每一个主机节点的NodePort端口都可以访问。
3.如果需要指定端口，不想随机产生，需要使用配置文件来声明。
![](https://cdn.nlark.com/yuque/0/2022/png/28915315/1664261419003-e9a5a68a-f988-48da-a51d-b8756bce8f24.png#averageHue=%23f7f6f5&from=url&id=md9bG&originHeight=762&originWidth=1306&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)



**命名空间(Namespace)**是一种资源隔离机制，将同一集群中的资源划分为相互隔离的组。
命名空间可以在多个用户之间划分集群资源（通过[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)）。

- 例如我们可以设置**开发、测试、生产**等多个命名空间。

同一命名空间内的资源名称要唯一，但跨命名空间时没有这个要求。 
命名空间作用域仅针对带有名字空间的对象，例如 Deployment、Service 等。
这种作用域对集群访问的对象不适用，例如 StorageClass、Node、PersistentVolume 等。

---

**Kubernetes 会创建四个初始命名空间：**

- `**default**` 默认的命名空间，不可删除，未指定命名空间的对象都会被分配到default中。
- `**kube-system**` Kubernetes 系统对象(控制平面和Node组件)所使用的命名空间。
- `**kube-public**`** **自动创建的公共命名空间，所有用户（包括未经过身份验证的用户）都可以读取它。通常我们约定，将整个集群中公用的可见和可读的资源放在这个空间中。 
- `**kube-node-lease**`** ** [租约（Lease）](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/lease-v1/)对象使用的命名空间。每个节点都有一个关联的 lease 对象，lease 是一种轻量级资源。lease对象通过发送[心跳](https://kubernetes.io/zh-cn/docs/concepts/architecture/nodes/#heartbeats)，检测集群中的每个节点是否发生故障。
> 使用`kubectl get lease -A`查看`lease`对象

```bash
# 获取所有namespace的所有Pod
[root@k3s-master52 ~]# kubectl get pod -A
NAMESPACE     NAME                                      READY   STATUS      RESTARTS        AGE
kube-system   helm-install-traefik-crd-bmc95            0/1     Completed   0               2d5h
kube-system   helm-install-traefik-ch646                0/1     Completed   1               2d5h
kube-system   svclb-traefik-145ced16-7zgm8              2/2     Running     4 (9h ago)      2d5h
kube-system   svclb-traefik-145ced16-vsrzd              2/2     Running     2 (9h ago)      2d5h
kube-system   local-path-provisioner-5b5579c644-q4rz5   1/1     Running     4 (9h ago)      2d5h
kube-system   metrics-server-74474969b-lf98p            1/1     Running     4 (9h ago)      2d5h
kube-system   coredns-75fc8f8fff-t8ktq                  1/1     Running     2 (9h ago)      2d5h
kube-system   traefik-7d647b7597-j5dnm                  1/1     Running     2 (9h ago)      2d5h
kube-system   svclb-traefik-145ced16-ttrph              2/2     Running     4 (6h28m ago)   2d5h
default       nginx-deploy-855866bb46-clg2r             1/1     Running     0               5h4m
default       nginx-deploy-855866bb46-8rdbn             1/1     Running     0               5h
default       nginx-deploy-855866bb46-qwtvj             1/1     Running     0               4h34m

# 查看lease空间内的所有对象
[root@k3s-master52 ~]# kubectl get lease -A
NAMESPACE         NAME           HOLDER         AGE
kube-node-lease   k3s-slave54    k3s-slave54    2d5h
kube-node-lease   k3s-master52   k3s-master52   2d5h
kube-node-lease   k3s-slave53    k3s-slave53    2d5h

# 创建一个新的ns: develop
[root@k3s-master52 ~]# kubectl create ns develop
namespace/develop created
# 创建一个pod,指定pod的ns
[root@k3s-master52 ~]# kubectl run nginx --image=nginx:1.22 -n=develop
pod/nginx created

[root@k3s-master52 ~]# kubectl get pod -n=develop
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          20s

# 修改develop为default的ns
[root@k3s-master52 ~]# kubectl config set-context $(kubectl config current-context) --namespace=develop
Context "default" modified.

[root@k3s-master52 ~]# kubectl get pod
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          75s

# 删除ns，释放ns内的所有资源，如果资源无法释放，删除失败
[root@k3s-master52 ~]# kubectl delete ns develop
namespace "develop" deleted
[root@k3s-master52 ~]# kubectl get ns
NAME              STATUS   AGE
default           Active   2d5h
kube-system       Active   2d5h
kube-public       Active   2d5h
kube-node-lease   Active   2d5h

```
## 六、Namespace命名空间
### 使用多个命名空间

- 命名空间是在多个用户之间划分集群资源的一种方法（通过[资源配额](https://kubernetes.io/zh-cn/docs/concepts/policy/resource-quotas/)）。
   - 例如我们可以设置**开发、测试、生产**等多个命名空间。
- 不必使用多个命名空间来分隔轻微不同的资源。
   - 例如同一软件的不同版本： 应该使用[标签](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/) 来区分同一命名空间中的不同资源。
- 命名空间适用于跨多个团队或项目的场景。
   - 对于只有几到几十个用户的集群，可以不用创建命名空间。
- 命名空间不能相互嵌套，每个 Kubernetes 资源只能在一个命名空间中。
### 管理命名空间
```bash
#创建命名空间
kubectl create namespace dev
#查看命名空间
kubectl get ns

#在命名空间内运行Pod
kubectl run nginx --image=nginx --namespace=dev
kubectl run my-nginx --image=nginx -n=dev

#查看命名空间内的Pod
kubectl get pods -n=dev

#查看命名空间内所有对象
kubectl get all
# 删除命名空间会删除命名空间下的所有内容
kubectl delete ns dev
```
### 切换当前命名空间
```bash
#查看当前上下文
kubectl config current-context

#将dev设为当前命名空间，后续所有操作都在此命名空间下执行。
kubectl config set-context $(kubectl config current-context) --namespace=dev
```


## 七、声明式对象配置（YAML）
:::info
**云原生的代表技术包括：**
		■容器
		■服务网格
		■微服务
		■不可变基础设施
		■**声明式API**
:::
### 管理K8S对象的方式
:::danger
●命令行指令
例如，使用kubectl命令来创建和管理 Kubernetes 对象。
命令行就好比口头传达，简单、快速、高效。
但它功能有限，不适合复杂场景，操作不容易追溯，多用于开发和调试。
:::
:::danger
**●声明式配置**
kubernetes使用yaml文件来描述 Kubernetes 对象。
声明式配置就好比申请表，学习难度大且配置麻烦。
好处是操作留痕，适合操作复杂的对象，多用于生产。
:::

### 常用命令缩写
| 名称 | 缩写 | Kind |
| --- | --- | --- |
| namespaces | ns | Namespace |
| nodes | no | Node |
| pods | po | Pod |
| services | svc | Service |
| deployments | deploy | Deployment |
| replicasets | rs | ReplicaSet |
| statefulsets | sts | StatefulSet |

### YAML规范
> - 缩进代表上下级关系
> - **缩进时不允许使用Tab键，只允许使用空格，通常缩进2个空格**
> - `**:**` 键值对，后面必须有空格
> - `**-**`列表，后面必须有空格
> - `**[ ]**`数组
> - `**#**`注释
> - `**|**` 多行文本块
> - `**---**`表示文档的开始，多用于分割多个资源对象

```yaml
group:
  name: group-1
  members:
    - name: "Jack Ma"
      UID: 10001
    - name: "Lei Jun"
      UID: 10002
    # comments
  words:
    ["I don't care money", "R U OK"]
  text: |
    line
    new line
    3rd line
---
group:
  name: group-2
  members:
    - name: "Jack Ma"
      UID: 10001
    - name: "Lei Jun"
      UID: 10002
    # comments
  words:
    ["I don't care money", "R U OK"]
  text: |
    line
    new line
    3rd line
---
```

### 配置对象
在创建的 Kubernetes 对象所对应的 yaml文件中，需要配置的字段如下：
● `** apiVersion **` - Kubernetes API 的版本
● ` **kind** `- 对象类别，例如Pod、Deployment、Service、ReplicaSet等
● `**metadata  **` - 描述对象的元数据，包括一个 name 字符串、UID 和可选的 namespace
●` **spec **` - 对象的配置

**掌握程度：**
■不要求自己会写
■找模版
■能看懂
■会修改
■能排错

---

**使用yaml定义一个Pod**
[Pod配置模版](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/#using-pods)
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.22
    ports:
    - containerPort: 80
```
**使用yaml文件管理对象**
```yaml
#创建对象
kubectl apply -f my-pod.yaml
#编辑对象
kubectl edit nginx
#删除对象
kubectl delete -f my-pod.yaml
```
### 标签
标签（Labels） 是附加到对象（比如 Pod）上的键值对，用于补充对象的描述信息。
标签使用户能够以松散的方式管理对象映射，而无需客户端存储这些映射。
由于一个集群中可能管理成千上万个容器，我们可以使用标签高效的进行选择和操作容器集合。
:::info
**键的格式：**	

- 前缀(可选)/名称(必须)。

**有效名称和值**：

- 必须为 63 个字符或更少（可以为空）
- 如果不为空，必须以字母数字字符（[a-z0-9A-Z]）开头和结尾
- 包含破折号-、下划线_、点.和字母或数字
:::
[label配置模版](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set)
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: label-demo
  labels: #定义Pod标签
    environment: test
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.22
    ports:
    - containerPort: 80
```
```bash
[root@k3s-master52 yaml]# vim label-pod.yaml
[root@k3s-master52 yaml]# [root@k3s-master52 yaml]# kubectl apply -f label-pod.yaml
pod/label-demo created
[root@k3s-master52 yaml]# kubectl get pod --show-labels
NAME                            READY   STATUS    RESTARTS   AGE     LABELS
nginx-deploy-855866bb46-clg2r   1/1     Running   0          5h32m   app=nginx-deploy,pod-template-hash=855866bb46
nginx-deploy-855866bb46-8rdbn   1/1     Running   0          5h28m   app=nginx-deploy,pod-template-hash=855866bb46
nginx-deploy-855866bb46-qwtvj   1/1     Running   0          5h1m    app=nginx-deploy,pod-template-hash=855866bb46
my-nginx                        1/1     Running   0          3m5s    <none>
label-demo                      1/1     Running   0          11s     app=nginx,environment=test

# 按标签显示
[root@k3s-master52 yaml]# kubectl get pod -l environment=test,app=nginx
NAME         READY   STATUS    RESTARTS   AGE
label-demo   1/1     Running   0          48s
```

### 选择器 创建Service
**标签选择器** 可以识别一组对象。标签不支持唯一性。
标签选择器最常见的用法是为Service选择一组Pod作为后端。

[Service配置模版](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/#type-nodeport)
```yaml
apiVersion: v1
kind: Service # 对象类型为Service
metadata: # 对象元数据
  name: my-service # Service名为my-service
spec:  # specify 对象的配置
  type: NodePort # 服务暴露类型为NodePort
  selector:  # service 选择器, 为service选择一组pod作为service后端
    app: nginx
  ports: # 定义容器端口
      # 默认情况下，为了方便起见，`targetPort` 被设置为与 `port` 字段相同的值。
    - port: 80
      targetPort: 80
      # 可选字段
      # 默认情况下，为了方便起见，Kubernetes 控制平面会从某个范围内分配一个端口号（默认：30000-32767）
      nodePort: 30007
```
```yaml
[root@k3s-master52 yaml]# kubectl apply -f my-service.yaml
service/my-service created

[root@k3s-master52 yaml]# kubectl get service
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
kubernetes      ClusterIP   10.43.0.1       <none>        443/TCP          2d6h
nginx-service   ClusterIP   10.43.13.226    <none>        8080/TCP         4h47m
nginx-outside   NodePort    10.43.215.199   <none>        8081:31384/TCP   3h44m
my-service      NodePort    10.43.211.172   <none>        80:30007/TCP     5s

[root@k3s-master52 yaml]# kubectl describe svc/my-service
Name:                     my-service
Namespace:                default
Labels:                   <none>
Annotations:              <none>
Selector:                 app=nginx
Type:                     NodePort
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.43.211.172
IPs:                      10.43.211.172
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  30007/TCP
Endpoints:                10.42.1.14:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
```

目前支持两种类型的选择运算：**基于等值的**和**基于集合的**。 
多个选择条件使用逗号分隔，相当于**And(&&)**运算。

- 等值选择
```yaml
selector:
  matchLabels: # component=redis && version=7.0
    component: redis
    version: 7.0
```

- 集合选择
```yaml
selector:
  matchExpressions: # tier in (cache, backend) && environment not in (dev, prod)
    - {key: tier, operator: In, values: [cache, backend]}
    - {key: environment, operator: NotIn, values: [dev, prod]}
```

参考资料：
[https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/kubernetes-objects/](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/kubernetes-objects/)
[https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/object-management/)
[https://kubernetes.io/docs/reference/kubectl/#resource-types](https://kubernetes.io/docs/reference/kubectl/#resource-types)
[https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/)
[https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/](https://kubernetes.io/zh-cn/docs/concepts/overview/working-with-objects/labels/)

## 金丝雀发布
:::info
**金丝雀部署(canary deployment)也被称为灰度发布。**
早期，工人下矿井之前会放入一只金丝雀检测井下是否存在有毒气体。
采用金丝雀部署，你可以在生产环境的基础设施中小范围的部署新的应用代码。
一旦应用签署发布，只有少数用户被路由到它，最大限度的降低影响。
如果没有错误发生，则将新版本逐渐推广到整个基础设施。
:::
![](https://cdn.nlark.com/yuque/0/2022/png/28915315/1663905517618-074351d1-bdc4-4a33-b9de-55d8bfa4c95b.png?x-oss-process=image%2Fresize%2Cw_589%2Climit_0#averageHue=%23f7f7f7&from=url&id=WjUyO&originHeight=390&originWidth=589&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)
### 部署过程
![](https://cdn.nlark.com/yuque/0/2022/png/28915315/1665656300936-3dff684a-d5da-4165-b70f-a28f183b57f6.png?x-oss-process=image%2Fresize%2Cw_607%2Climit_0#averageHue=%23fbfcf7&from=url&id=gABjk&originHeight=376&originWidth=607&originalType=binary&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&title=)

### 部署V1版本 nginx-deployment-v1
发布v1版本的应用，镜像使用`nginx:1.22`,数量为 3。

- **创建Namespace**

[Namespace配置模版](https://kubernetes.io/docs/tasks/administer-cluster/namespaces/#creating-a-new-namespace)

- **创建Deployment**

[Deployment配置模版](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment)

- **创建外部访问的Service**

[Service配置模版](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-v1
  namespace: dev
  labels:
    app: nginx-deployment-v1
spec:
  replicas: 3
  selector:
    matchLabels: # 跟template.metadata.labels一致
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.22
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: canary-demo
  namespace: dev
spec:
  type: NodePort
  selector: # 更Deployment中的selector一致
    app: nginx
  ports:
      # By default and for convenience, the `targetPort` is set to the same value as the `port` field.
    - port: 80
      targetPort: 80
      # Optional field
      # By default and for convenience, the Kubernetes control plane will allocate a port from a range (default: 30000-32767)
      nodePort: 30008
```
```bash
# 创建yaml文件，配置服务内容
vim ~/deploy-v1.yaml
# 通过yaml创建
# Namespace:dev
# deploy:nginx-deployment-v1 
# Service: canary-demo
kubectl apply -f ~/deploy-v1.yaml
# 查看服务canary-demo详情
kubectl describe service canary-demo -n=dev
```
### 部署V2版本 nginx-deployment-canary
#### 创建Canary Deployment
发布新版本的应用，镜像使用docker/getting-started，数量为 1。
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-canary
  namespace: dev
  labels:
    app: nginx-deployment-canary
spec:
  replicas: 1
  selector:
    matchLabels: # 跟template.metadata.labels一致
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
        track: canary
    spec:
      containers:
        - name: new-nginx
          image: docker/getting-started
          ports:
            - containerPort: 80
```
```bash
# 发布服务新版本
kubectl apply -f deploy-canary.yaml

# 查看详情
kubectl describe service canary-demo -n=dev

# 将新版本服务扩容
kubectl scale deploy nginx-deployment-canary --replicas=3 -n=dev

# 将旧服务下线
kubectl scale deploy nginx-deployment-v1 --replicas=0 -n=dev

# 清空环境
kubectl delete all --all -n=dev
```
> **局限性**
> 按照 Kubernetes 默认支持的这种方式进行金丝雀发布，有一定的局限性：
> - 不能根据用户注册时间、地区等请求中的内容属性进行流量分配
> - 同一个用户如果多次调用该 Service，有可能第一次请求到了旧版本的 Pod，第二次请求到了新版本的 Pod
> 
在 Kubernetes 中不能解决上述局限性的原因是：Kubernetes Service 只在 TCP 层面解决负载均衡的问题，并不对请求响应的消息内容做任何解析和识别。如果想要更完善地实现金丝雀发布，可以考虑Istio灰度发布。

参考文档：
[https://www.infoq.cn/article/lei4vsfpiw5a6en-aso4](https://www.infoq.cn/article/lei4vsfpiw5a6en-aso4)
[https://kuboard.cn/learning/k8s-intermediate/workload/wl-deployment/canary.html](https://kuboard.cn/learning/k8s-intermediate/workload/wl-deployment/canary.html)
