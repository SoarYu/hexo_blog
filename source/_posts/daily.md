---
title: 操作系统-磁盘内存管理
date: 2022-01-05 04:04:43
categories: 
 - 学习
---

cpu cache mesi

mysql 最左匹配原则

mutex rwlock 悲观锁 读多写少

cas  读多写少 无锁map 乐观锁 原子操作

map 线程安全

空结构体 不占内存

切片数组 值类型直接对应内存中的值 引用类型指向内存中存放该值的地址

gc 三色标记 stw 停止 sink 对象池



# tcp 查询状态 timewait closewait 
https://blog.csdn.net/Shuffle_Ts/article/details/93778635
https://blog.csdn.net/Shuffle_Ts/article/details/93909003

# 缓存一致性  https://www.cnblogs.com/xiaolincoding/p/16493675.html
1. 旁路缓存：先更新数据库再删除缓存，而不是更新缓存 lazy 用到在取 用到在初始化
2. 直写： 
3. 回写/写回：

# cpu cache 一致性 mesi https://www.cnblogs.com/xiaolincoding/p/13886559.html
以前100MHZ的cpu主频的时代，cpu直接从内存读取数据还是能接受的，后来CPU的频率太快了，快到主存跟不上，这样在处理器时钟周期内，CPU常常需要等待主存，这样就会浪费资源。

缓解CPU和内存之间速度的不匹配问题，出现cpu cache

解决cpu cache 与 memeory 保持数据一致，提出只写和回写

解决多核cpu里的cache 缓存一致性，提出mesi（modify exclusive shared invalidated）


## 0201 总结 todo

讲讲go的协程、协程与线程 https://blog.csdn.net/weixin_49199646/article/details/109210547 内核无法感知的用户态级别的线程，有程序自行创建，管理，销毁。

让你实现一个RPC框架，应该要考虑哪些点
grpc

go怎么做到面向对象

/*
如果延时topic里有一亿条消息，如何取出即将到延时时间的消息？全表扫描？
看你说服务QPS很高，对于高并发场景下有什么需要注意的问题
异步调用一定比同步调用快吗
100的QPS，同步调用开100个进程，是否比多线程（线程池）更优？
*/

四次挥手中TIME_WAITED等待2MSL的原因

一亿个文件，每个文件里有一亿个字符串，找出相同的字符串

# 0203 todo

阻塞IO和非阻塞IO有什么区别 

零拷贝： io时数据需要在内核态和用户态间的数据缓存区进行多次拷贝传输，造成频繁用户态和内核态的上下文切换和内存拷贝的次数，效率低下。 

如何实现多路复用IO
https://zhuanlan.zhihu.com/p/115220699
可以在单线程/进程中处理多个事件流(鼠标键盘 中断) 解决的本质问题是在用更少的资源完成更多的事。

select、epoll原理

Redis跳表如何实现？时间复杂度？
MySQL联合索引使用问题，覆盖索引相关。

arp表的作用？arp的分组格式？对于主机不存在的apr请求会发生什么？

DNS的作用？DNS的解析流程？

下一跳路由转发数据包的过程？

协程切换的时机？
若 主goroutine 比 子goroutine 先结束会有什么问题？ 

MySQL默认**事务隔离**级别

InnoDB索引的底层数据结构及其优点
b+树
层级浅，效率高
叶子节点使用链表连接，范围查询搞笑


## 0204 设计模式 todo

总共有 23 种设计模式。这些模式可以分为三大类：创建型模式（Creational Patterns）、结构型模式（Structural Patterns）、行为型模式（Behavioral Patterns）

创建型模式
这些设计模式提供了一种在创建对象的同时隐藏创建逻辑的方式，而不是使用 new 运算符直接实例化对象。这使得程序在判断针对某个给定实例需要创建哪些对象时更加灵活。

结构型模式
这些设计模式关注类和对象的组合。继承的概念被用来组合接口和定义组合对象获得新功能的方式。

行为型模式
这些设计模式特别关注对象之间的通信。


### 单例模式 singleton
一个类实例一个对象，该对象在类中实例化后由类自己管理，只提供全局访问的接口方法，防止其他地方修改。

饿汉式 lazy ： 第一次访问使用才初始化， 避免资源浪费。确保线程安全，防止同时访问实例化产生多个对象。
单锁: 整个接口加锁
双重锁：接口不加锁， 对象为null，初始化才获取锁（该锁检查对象是否初始化），不用每次访问都要获取锁造成线程的阻塞。

使⽤场景总结：
1. 频繁实例化然后又销毁的对象，使用单例模式可以提高性能
2. 经常使用的对象，但实例化时耗费时间或者资源多，如数据库连接池，使用单例模式，可以提高性能，降低资源损坏
3. 使用线程池之类的控制资源时，使用单例模式，可以方便资源之间的通信

### 策略模式 stragety

对两个数xy进行运算，可以通过计算器中包含的加减乘除等多种运算策略，根据不同的运算策略来得到运算结果。

去某个地方，可以选择飞机、高铁、顺风车、自驾等方式。

定义一系列的算法，把它们单独封装起来，并且使它们可以互相替换，使得算法可以独立于使用它的客户端而变化，也是说**这些算法所完成的功能类型是一样的，对外接口也是一样的**，只是**不同的策略为引起环境角色表现出不同的行为**。

相比于使用大量的if...else，使用策略模式可以降低复杂度，使得代码更容易维护。缺点：可能需要定义大量的策略类，并且这些策略类都要提供给客户端。

优点：
使用策略模式可以避免使用多重条件转移语句。多重转移语句将算法或行为的逻辑混合在一起，不易维护

缺点：
客户端必须知道所有的策略类，并自行决定使用哪一个策略类，策略模式只适用于客户端知道所有的算法或行为的情况。


## 0205 
### http tcp keepalive 长连接 

https://zhuanlan.zhihu.com/p/224595048

#### http keepalive

无状态 HTTP协议永远都是客户端发起请求，服务器回送响应。每次连接只处理一个请求，当服务器返回本次请求的应答后便立即关闭连接。 不会记录http历史连接信息。

HTTP协议运行在TCP协议之上，它无状态会导致客户端的每次请求都需要重新建立TCP连接，接受到服务端响应后，断开TCP连接。对于每次建立、断开TCP连接，还是有相当的性能损耗的。

减少性能损耗: keep-alive 机制

http1.0默认关闭，开启参数 connection:keep-alive
http1.1默认开启，关闭参数 connection:close

keep-alive机制：若开启后，在一次http请求中，服务器进行响应后，**不再直接断开TCP连接**，而是将TCP连接维持一段时间。在这段时间内，如果同一客户端再次向服务端发起http请求，便可以复用此TCP连接，向服务端发起请求，并重置timeout时间计数器，在接下来一段时间内还可以继续复用。这样无疑省略了反复创建和销毁TCP连接的损耗。

#### tcp keepalive

tcp 三次握手建立连接，数据发送完成，连接进入不活跃状态，双方有一端开启保活功能，发送保活报文，另一端成功接收响应报文，重置保活时间计数器。若由于网络原因或其他原因导致，发送端无法正常收到保活探测报文的响应。再次发送直至达到探测循环次数都没有接收到对端响应，认为不可达，中断处理。
<!-- 
如果在一段时间（保活时间：tcp_keepalive_time）内此连接都不活跃，开启保活功能的一端会向对端发送一个保活探测报文。

若对端正常存活，且连接有效，对端必然能收到探测报文并进行响应。此时，发送端收到响应报文则证明TCP连接正常，重置保活时间计数器即可。

若由于网络原因或其他原因导致，发送端无法正常收到保活探测报文的响应。那么在一定探测时间间隔（tcp_keepalive_intvl）后，将继续发送保活探测报文。直到收到对端的响应，或者达到配置的探测循环次数上限（tcp_keepalive_probes）都没有收到对端响应，这时对端会被认为不可达，TCP连接随存在但已失效，需要将连接做中断处理。 -->


#### 回到文章开头提出的问题：HTTP和TCP的长连接有何区别？HTTP中的keep-alive和TCP中keepalive又有什么区别？

1、TCP连接往往就是我们广义理解上的长连接，因为它具备双端连续收发报文的能力；
开启了keep-alive的HTTP连接，也是一种长连接，但是它由于协议本身的限制，服务端无法主动发起应用报文。

2、TCP中的keepalive是用来保鲜、保活的；
HTTP中的keep-alive机制主要为了让支撑它的TCP连接活的的更久，所以通常又叫做：HTTP persistent connection（持久连接） 和 HTTP connection reuse（连接重用）。
-   

### websocket 传输过程

### 负载均衡算法 https://zhuanlan.zhihu.com/p/68733507
1、轮询法

将请求按顺序轮流地分配到后端服务器上，它均衡地对待后端的每一台服务器，而不关心服务器实际的连接数和当前的系统负载。

2、随机法

通过系统的随机算法，根据后端服务器的列表大小值来随机选取其中的一台服务器进行访问。由概率统计理论可以得知，随着客户端调用服务端的次数增多，

其实际效果越来越接近于平均分配调用量到后端的每一台服务器，也就是轮询的结果。

3、源地址哈希法

源地址哈希的思想是根据获取客户端的IP地址，通过哈希函数计算得到的一个数值，用该数值对服务器列表的大小进行取模运算，得到的结果便是客服端要访问服务器的序号。采用源地址哈希法进行负载均衡，同一IP地址的客户端，当后端服务器列表不变时，它每次都会映射到同一台后端服务器进行访问。

4、加权轮询法

不同的后端服务器可能机器的配置和当前系统的负载并不相同，因此它们的抗压能力也不相同。给配置高、负载低的机器配置更高的权重，让其处理更多的请；而配置低、负载高的机器，给其分配较低的权重，降低其系统负载，加权轮询能很好地处理这一问题，并将请求顺序且按照权重分配到后端。

5、加权随机法

与加权轮询法一样，加权随机法也根据后端机器的配置，系统的负载分配不同的权重。不同的是，它是按照权重随机请求后端服务器，而非顺序。

6、最小连接数法

最小连接数算法比较灵活和智能，由于后端服务器的配置不尽相同，对于请求的处理有快有慢，它是根据后端服务器当前的连接情况，动态地选取其中当前
积压连接数最少的一台服务器来处理当前的请求，尽可能地提高后端服务的利用效率，将负责合理地分流到每一台服务器。


### 缓存 https://zhuanlan.zhihu.com/p/346651831
缓存雪崩|大量keys
保存过期随机值，防止大量keys失效
熔断机制 禁止部分访问

缓存击穿|热点 
设置热点key永久保存
互斥锁 针对热点

缓存穿透|null
设置value为null的key
布隆过滤器 访问数据库前先查询，存在有可能误判才去查询，不存在一定不存在返回null

### websocket 过程 原理

1. 客户端发送 http header里包含 upgrade:websocket 请求  
2. 服务端接收返回 101状态码 表示同意升级
3. 连接复用此前http建立的tcp连接

WebSocket 实现了**双向通信**的技术了，迄今为止，大部分开发者还是使用 Ajax 轮询来实现，但这是个不太优雅的解决办法，WebSocket 虽然用的人不多，可能是因为协议刚出来的时候有安全性的问题以及兼容的浏览器比较少，但现在都有解决。如果你有这些需求可以考虑使用 WebSocket：

1 、多个用户之间进行交互；

2、需要频繁地向服务端请求更新数据。

比如弹幕、消息订阅、多玩家游戏、协同编辑、股票基金实时报价、视频会议、在线教育等需要高实时的场景。


## 0206

### 分库分表 todo

### cas 乐观锁 原子操作 实际无锁算法 compare and swap 比较并交换

atomic.CompareAndSwap

原子操作 要么完全不执行，要么全部执行完。

假定有两个操作A 和B，如果从执行A 的线程来看，当另一个线程执行B 时，要么将B 全部执行完，要么完全不执行B，那么A 和B 对彼此来说是原子的。

CAS是一种无锁算法，CAS有3个操作数，内存位置（V）、预期原值（A）和新值(B)。当且仅当预期值A和内存值V相同时，将内存值V修改为B，否则不会进行修改。

如何确保线程安全？
启动10个线程循环自增i的值10次，让 i:=1 循环自增到100 

1. 与原值不匹配 循环
a、b线程同时 读取i=1, 修改后a比b先修改完成，此时i被a修改为2。此时，b线程修改i时发现i=2,放弃修改，并进入循环此前操作（获取i进行自增操作），直到i符合预期值才完成修改。

2. 或者原值修改aba
加入版本号或时间戳，符合预期再更新


### 项目：  分布式面试 
grpc 定义传输格式： .protobuf文件 生成 .go文件 里面定义了数据格式的结构体，以及序列化和反序列化的方法


### 微服务
https://github.com/rubyhan1314/Golang-100-Days/blob/master/Day76(%E5%BE%AE%E6%9C%8D%E5%8A%A1%E7%89%B9%E6%80%A7)/day76_%E5%BE%AE%E6%9C%8D%E5%8A%A1%E7%AE%80%E4%BB%8B%E5%8F%8A%E7%89%B9%E6%80%A7%E4%BB%8B%E7%BB%8D.md

将传统的单体项目系统，按项目的架构层次拆解成多个微服务(应用层、业务层、基础服务层、数据层)，独立进行开发、测试、部署，组成分布式系统。

优点：降低耦合 利于团队分工协作 快速迭代 提高效率 独立部署 扩展能力强

缺点：规模大小难以界定 增加系统复杂度(通信调用、协调多个架构) 多次部署 单元测试容易整体系统测试困难  分区数据库架构难题（单个库只需访问表、分布式需要通过不同接口更新多个模块数据）

#### 此外，需要注意微服务之间的通信方式
1. 同步调用 (RESTAPI、RPC)
REST：REST基于HTTP，实现更容易，各种语言都支持，同时能够跨客户端，对客户端没有特殊的要求，只要具备HTTP的网络请求库功能就能使用。

RPC：rpc的特点是传输效率高，安全性可控，在系统内部调用实现时使用的较多。

基于REST和RPC的特点，我们通常采用的原则为：向系统外部暴露采用REST，向系统内部暴露调用采用RPC方式。

2. 异步调用（定时任务）kafaka rabbitmq
可以提高服务性能，代价是降低实时性，但数据一致性会有延时，不会立刻同步完成，但是最终会完成数据同步。

####  如何实现众多微服务

如何让分布式系统的微服务相互感知对方并进行通信（服务中心）
通过服务中心实现服务发现、服务注册、服务订阅
etcd https://zhuanlan.zhihu.com/p/143564728


### 分布式锁 https://zhuanlan.zhihu.com/p/42056183 todo
Redis分布式锁
Redis分布式锁如何实现的
分布式锁还有哪些实现方案


### 海量数据 todo https://www.cnblogs.com/GarrettWale/p/14478347.html

## 0209

### git merge rebase  

merge 可以体现出两个分支里的commit时间线，但合并解决冲突后会产生新的commit记录，而且保留许多冗余的commit，造成git的分支树越来越复杂。

rebase 是打乱commit的时间线的，更像是移植的方法，以两条分支的公共节点为基地，将一条分支新产生的commit 移植到 当前分支上，冲突的解决直接包含在最新的commit里，不产生新的commit

feature :  a -> b -> e -> f

master : a -> b -> c -> d -> g
                                ---> e -> f  ------>
							   --->	   			     g			
merge:   两条分支呈树形的合并 a -> b -> c -> d -> e ->     产生一个用于记录合并的commit g

rebase:  master rebase feature: a -> b -> c -> d -> g -> e -> f' 从两个分支的父分支开始



## hash skiplist 红黑树 avl

红黑树 avl
https://cloud.tencent.com/developer/article/1660840

二叉平衡树(AVL)：二叉平衡树是在二叉搜素树的基础上加上了限制：任意节点，左右子树的高度差不能超过1。这个约束常常借助左旋和右旋操作实现。

1. 红黑树的规则特性： 弱平衡

节点分为红色或者黑色；
根节点必为黑色；
叶子节点都为黑色，且为null；
连接红色节点的两个子节点都为黑色（红黑树不会出现相邻的红色节点）；
从任意节点出发，到其每个叶子节点的路径中包含相同数量的黑色节点；
新加入到红黑树的节点为红色节点；(其实这个是推断出来的，下面会说)

总结红黑树的调整情形：
1. 新插入红黑树的节点一定是红色
 2. 若新插入节点的爸爸是黑色节点，红黑树不需要调整
 3. 若新插入节点的爸爸和它叔叔都是红色节点，红黑树只需要变色，不需要旋转
 4. 若新插入节点的爸爸是红色，但是它叔叔是黑色（可能为null，但是null是叶子节点，正儿八经的黑色），这时，一定是变色+旋转。

红黑树的规则特点能够推断出什么东西？
从根节点到叶子节点的最长路径不大于最短路径的2倍



## grpc 
rpc框架 http/2 心跳 protobuf协议

## nacos
服务注册发现中心，配置中心，支持 sdkrpc httpapi
namespace group instance service

## etcd 
分布式kv

##