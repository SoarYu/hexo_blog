---
title: 计算机网络
date: 2022-11-09 21:37:43
categories: 
 - 计算机网络
---

# 计算机网络

## 一、基础

### 1.1 计算机网络体系结构

计算机网络体系结构，一般有三种：OSI 七层结构、TCP/IP 五层结构

[](/img/computer-networking/structure.png)

1. 应用层HTTP：应用层决定了向用户提供应用服务时通信的活动。（HTTP、DNS、FTP）

2. 传输层TCP 通信端口：（TCP）为应用层实体提供端到端的通信功能，建立处于网络连接中两台计算机之间的数据传输，保证数据包的顺序传送及数据的完整性。传输层则要负责把数据包传给应⽤，但是⼀台设备上可能会有很多应⽤在接收或者传输数据，因此需要⽤⼀个编号将应⽤区分开来，这个编号就是端⼝。


3. 网络层IP（网络地址）: 网络上有大量节点和路径，网络层负责为在网络上流动的数据包根据其目标地址，选择数据包的下一个目的地以及前往的路径，**数据包**是网络传输的最小数据单位。

规定了通过怎样的路径到达对方计算机，并把数据包传送给对方。（IP、ARP）IP 协议的寻址作⽤是告诉我们去往下⼀个⽬的地该朝哪个⽅向⾛，路由则是根据「下⼀个⽬的地」选择路径。寻址更像在导航，路由更像在操作⽅向盘


4. 链路层：MAC地址、路由器（设备实体） 主要为⽹络层提供链路级别传输的服务， 跨网络传输时 每⼀台设备的⽹卡都会有⼀个 MAC 地址，它就是⽤来唯⼀标识设备的。路由器计算出了下⼀个⽬的地 IP 地址，再通过 ARP 协议找到该⽬的地的 MAC 地址，这样就知道这个 IP 地址是哪个设备的了。

数据链路层把网络层传下来的分组封装成帧。


5. 物理层BIT:网络中数据的传输，最终都需要通过在**物理介质**中传输，物理层提供把数据转换成电信号进行⼆进制BIT传输的服务。

考虑的是怎样在传输媒体上传输数据比特流，而不是指具体的传输媒体。物理层的作用是尽可能屏蔽传输媒体和通信手段的差异，使数据链路层感觉不到这些差异。

### 1.2 每一层对应的网络协议有哪些？

[](/img/computer-networking/proto.png)

### 1.2 数据在各层之间是怎么传输的?

对于发送方而言，从上层到下层, 层层包装，对于接收方而言，从下层到上层，层层解开包装。

[](/img/computer-networking/transportation.png)

图中的5,4,3,2,1 分别代表TCP/IP协议的应用层、传输层、网络层、数据链路层、物理层，h5,h4,h3,h2代表相应层的控制信息。

这张图展示的是AP1进程向AP2进程传送数据。首先AP1先将数据交给本主机的应用层(第5层)，然后第五层加上必要的控制信息就变成了第四层的数据单元。然后第四层再加上必要的控制信息就变成了第三层的数据单元，以此类推直到第二层(数据链路层)，控制信息变成了首部H2(MAC头地址信息)和尾部T2(FCS:帧校验序列)。 当数据离开路由器到达AP2时，就和上面一样，以此向上最终将数据发送到进程AP2。

* 发送方的应用进程向接收方的应用进程传送数据
* AP先将数据交给本主机的应用层，应用层加上本层的控制信息H5就变成了下一层的数据单元
* 传输层收到这个数据单元后，加上本层的控制信息H4，再交给网络层，成为网络层的数据单元
* 到了数据链路层，控制信息被分成两部分，分别加到本层数据单元的首部（H2）和尾部（T2）
* 最后的物理层，进行比特流的传输

## 二、
