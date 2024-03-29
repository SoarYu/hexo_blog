---
title: 计算机网络
date: 2022-11-09 21:37:43
description: 计算机网络学习记录
categories: 
 - 学习笔记
---

# 一、基础

## 1.1 计算机网络体系结构

计算机网络体系结构：

OSI 七层结构

TCP/IP 五层结构
<!-- more -->
[](/img/computer-networking/structure.png)

1. 应用层HTTP：应用层决定了向用户提供应用服务时通信的活动。（HTTP、DNS、FTP）

2. 传输层TCP 通信端口：（TCP）为应用层实体提供端到端的通信功能，建立处于网络连接中两台计算机之间的数据传输，保证数据包的顺序传送及数据的完整性。传输层则要负责把数据包传给应⽤，但是⼀台设备上可能会有很多应⽤在接收或者传输数据，因此需要⽤⼀个编号将应⽤区分开来，这个编号就是端⼝。

3. 网络层IP（网络地址）: 网络上有大量节点和路径，网络层负责为在网络上流动的数据包根据其目标地址，选择数据包的下一个目的地以及前往的路径，**数据包**是网络传输的最小数据单位。

规定了通过怎样的路径到达对方计算机，并把数据包传送给对方。（IP、ARP）IP 协议的寻址作⽤是告诉我们去往下⼀个⽬的地该朝哪个⽅向⾛，路由则是根据「下⼀个⽬的地」选择路径。寻址更像在导航，路由更像在操作⽅向盘


4. 链路层：MAC地址、路由器（设备实体） 主要为⽹络层提供链路级别传输的服务， 跨网络传输时 每⼀台设备的⽹卡都会有⼀个 MAC 地址，它就是⽤来唯⼀标识设备的。路由器计算出了下⼀个⽬的地 IP 地址，再通过 ARP 协议找到该⽬的地的 MAC 地址，这样就知道这个 IP 地址是哪个设备的了。

数据链路层把网络层传下来的分组封装成帧。


5. 物理层BIT:网络中数据的传输，最终都需要通过在**物理介质**中传输，物理层提供把数据转换成电信号进行⼆进制BIT传输的服务。

考虑的是怎样在传输媒体上传输数据比特流，而不是指具体的传输媒体。物理层的作用是尽可能屏蔽传输媒体和通信手段的差异，使数据链路层感觉不到这些差异。

## 1.2 每一层对应的网络协议有哪些？

[](/img/computer-networking/proto.png)

## 1.2 数据在各层之间是怎么传输的?

对于发送方而言，从上层到下层, 层层包装，对于接收方而言，从下层到上层，层层解开包装。

[](/img/computer-networking/transportation.png)

图中的5,4,3,2,1 分别代表TCP/IP协议的应用层、传输层、网络层、数据链路层、物理层，h5,h4,h3,h2代表相应层的控制信息。

这张图展示的是AP1进程向AP2进程传送数据。首先AP1先将数据交给本主机的应用层(第5层)，然后第五层加上必要的控制信息就变成了第四层的数据单元。然后第四层再加上必要的控制信息就变成了第三层的数据单元，以此类推直到第二层(数据链路层)，控制信息变成了首部H2(MAC头地址信息)和尾部T2(FCS:帧校验序列)。 当数据离开路由器到达AP2时，就和上面一样，以此向上最终将数据发送到进程AP2。

* 发送方的应用进程向接收方的应用进程传送数据
* AP先将数据交给本主机的应用层，应用层加上本层的控制信息H5就变成了下一层的数据单元
* 传输层收到这个数据单元后，加上本层的控制信息H4，再交给网络层，成为网络层的数据单元
* 到了数据链路层，控制信息被分成两部分，分别加到本层数据单元的首部（H2）和尾部（T2）
* 最后的物理层，进行比特流的传输

# 二、 TCP

连接三次挥手，释放四次握手，可靠性保证， 滑动窗口，拥堵控制，流量控制，重传机制 

UDP及其区别


## 2.1 TCP与UDP 概念、区别、联系

[](/img/computer-networking/TCPAndUDP.png)

1. 连接

TCP是面向连接的，在传输前需要三次握手建立连接，UDP不需要连接，即刻传输数据。

UDP 是不需要和 TCP 一样在发送数据前进行三次握手建立连接的，想发数据就可以开始发送了。 并且也只是数据报文的搬运工，不会对数据报文进行任何拆分和拼接操作。

2. 服务形式（单播，多播，广播）

TCP只能一对一，点对点服务，UDP支持一对一、一对多、多对多通信。

3. 可靠性: TCP可靠、 UDP不可靠

- TCP保证数据可靠交付，拥有确认应答和重传机制，无重复、不丢失、按序到达；UDP尽可能交付，不保证可靠性。

- UDP 首先不可靠性体现在无连接上，通信都不需要建立连接，想发就发，这样的情况肯定不可靠。 并且收到什么数据就传递什么数据，并且也不会备份数据，发送数据也不会关心对方是否已经正确接收到数据了。

4. 拥塞控制机制

- TCP拥有流量控制、拥塞控制，保证传输安全性等，UDP在网络拥堵情况下不会降低发送速率。

- UDP 因为没有拥塞控制，一直会以恒定的速度发送数据。即使网络条件不好，也不会对发送速率进行调整。

这样实现的弊端就是在网络条件不好的情况下可能会导致丢包，但是优点也很明显，在某些实时性要求高的场景（比如电话会议）就需要使用 UDP 而不是 TCP。

5. 首部大小

TCP首部长度不适用选项字段是20字节，使用选项字段长度增加（可变），UDP首部固定8字节（头部开销小，传输数据报文时高效）。

6. 传输方式

TCP基于字节流，没有边界，但是保证传输顺序和可靠性；

UDP继承了IP层特性，基于数据包，有边界可能出现乱序和丢包。

7. 分片方式 (边界)

TCP数据大于MSS时会在TCP层将数据进行分片传输，到达目的地后同样在传输层进行合并，如果有某个片丢失则只需要重传丢失的分片即可；

UDP数据大丁MTU时会在IP层分片，同样也在目的IP层合并，如果某个IP分片丢失，则需要将所有分片都进行重传，开销大。

### 总结:
- TCP向上层提供面向连接的可靠服务 ，UDP向上层提供无连接不可靠服务。
- 虽然 UDP 并没有 TCP 传输来的准确，但是也能在很多实时性要求高的地方有所作为
- 对数据准确性要求高，速度可以相对较慢的，可以选用TCP

## 2.2 TCP 报文

## 2.2 三次握手 过程机制 为什么不是两次或四次 syn攻击 rst断开连接

SYN（ACK + SYN) ACK

![](/img/computer-networking/tcp-shakehand.png)

第一次握手：你能和我建立连接吗，可以接受到我的数据吗。

​ SYN = 1 ，seq = x

第二次握手：可以建立连接，我接受到你的请求了，能接受到我的数据吗，你的数据是这个吗

​ SYN = 1 ，ACK = 1 ，seq = y ，确认应答号ack = x + 1

第三次握手：我已经收到你的回复，这是我的数据，这是你的数据（用于再次核对）

​ ACK = 1 ，seq = x + 1 ，确认应答号ack = y + 1

建立连接成功。

总结
就这样，把标签解释的很简单了，这样在回头去看字段的正常解释，就很简单理解啦~

各字段在TCP三次握手中的作用：


SYN：用于建立连接。

ACK：用于确定收到了请求。

seq：发送自己的数据。包的序列号

ackNum确认应答号：发送接收到的对方的数据。

从上⾯的过程可以发现第三次握⼿是可以携带数据的，前两次握⼿是不可以携带数据的，这也是⾯试常问的题。
⼀旦完成三次握⼿，双⽅都处于 ESTABLISHED 状态，此时连接就已建⽴完成，客户端和服务端就可以相互发送数
据了


TCP 建⽴连接时，通过三次握⼿能防⽌历史连接的建⽴，能减少双⽅不必要的资源开销，能帮助双⽅同步初始化序
列号。序列号能够保证数据包不᯿复、不丢弃和按序传输。
## 2.3 四次挥手 todo



## 2.4  TCP 可靠性保证：  流量控制、拥塞控制、滑动窗⼝（swnd、rwnd、cwnd）、重传机制

校验和CheckSum、 序列号seq、 确认应答ACK、 最大消息长度MSS、 慢启动阀值 ssthresh、 往返时间RTT(Round-trip Time)、 SACK 选择要接受的seq范围

流量控制：滑动窗口cached（swnd、rwnd、cwnd）、重传机制 ACK重复（超时重传、快速重传、SACK、D-SACK）

拥塞控制：慢启动 指数、拥塞避免 线性、拥塞发生 下降、快速恢复

TCP保证可靠性：

1、序列号、确认应答、超时重传 数据到达接收方，接收方需要发出一个确认应答，表示已经收到该数据段，并且确认序列号，序列号说明了它下一次需要接收的数据序列号，保证数据传输有序。如果发送方迟迟未收到确认应答，那么可能是发送的数据丢失，也可能是确认应答丢失，这时发送方在等待一段时间后进行重传。

2、窗口控制 TCP会利用窗口控制来提高传输速度，意思是在一个窗口大小内，不用一定等到应答才能发送下一段数据，窗口大小就是无需等待确认而可以继续发送数据的最大值。如果不使用窗口控制，每一个没收到确认应答的数据都要重发。 使用窗口控制，如果数据段1001-2000丢失，后面数据每次传输，确认应答都会不停发送序号为1001的应答，表示我要接收1001开始的数据，发送端如果收到3次相同应答，就会立刻进行重发；数据一旦丢失，接收端会一直提醒。

3、拥塞控制 如果把窗口定的很大，发送端连续发送大量的数据，可能造成网络的拥堵。为了防止拥堵，进行拥塞控制。

（1）慢启动：定义拥塞窗口，一开始将该窗口大小设为1，之后每次收到一次确认应答（一次成功来回传输），将拥塞窗口大小*2

（2）拥塞避免：设置慢启动阈值，一般开始都设为65536。拥塞避免是只当拥塞窗口大小达到这个阈值，拥塞窗口的值不再指数上升，而是+1

（3）快恢复：将报文段的超时重传看做拥塞，则一旦发生超时重传，我们就将阈值设为当前窗口大小的一半，并且窗口大小变为1，重新进入慢启动过程

（4）快速重传：3次重复确认应答，立即重传。




# 三、 IP

网络层和数据链路层的联系与区别

ip地址：分类 子网划分(网络号、主机号、子网号、子网掩码)、单播组播广播

衍生协议原理作用、优缺点：DNS、ARP(RARP)、NAT、ICMP、IGMP

ping、traceroute

路由表   、TTL、MTU、IP 超出MTU(1500byte)大小分组

DNS: 本地缓存(浏览器、操作系统) hosts文件 根. 域.com 权威server.com 

ARP(RARP):主机查路由表获取下一跳IP地址，向网络广播ARP请求获取该IP的MAC，目的MAC收到广播后发送ARP响应告诉源主机其MAC地址。

RARP: RARP服务器存储IP和MAC的映射信息，主机向RARP服务器发起请求，服务器根据MAC发送对应的IP

NAT：（内网）私有IP访问（外网）公有IP的中转代理， 根据IP address + port 来传输建立连接
优点：外网不知道内网的网络信息，安全。
缺点：代理建立开销大。NAT服务器遇到故障重启，此前建立的连接需要重置。

ICMP：查询报文类型、差错报文类型。
主要的功能包括：确认 IP 包是否成功送达⽬标地址、报告发送过程中 IP 包被废弃的原因和改善⽹络设置等。

IGMP


# 四、 HTTP/ HTTPS

HTTP: 特性（优缺点）， 报文，状态码和方法， HTTP2， 

HTTPS: 特性（优缺点）， 加密流程

## 4.1 HTTP 基本特性 80

HTTP 超⽂本传输协议

特性：简单、灵活、易于扩展、应用广泛和可以跨平台传输。

1. 简单:
基本报文格式为header＋body，头部信息也是key—value简单文本的形式，易于理解

2. 灵活、易于扩展:
HTTP协议里的各种请求方法、URI／URL、状态码、头字段等每个组成要求都没有被固定死，都允许开发人员自定义和扩充；

3. 无状态：
服务器不会去记忆HTTP的状态，每个请求都是独立的。所以不需要额外的资源来记录状态信息，这能减轻服务器的负担。但它在完成有会话交互性的操作时会非常麻烦。

比如当浏览器第一次发送请求给服务器时，服务器响应了；如果同个浏览器发起第
二次请求给服务器时，它还是会响应，但是呢，服务器不知道你就是刚才的那个浏
览器。

4. 明文传输：
传输过程中的信息，是可方便阅读的，通过浏览器的F12控制台或抓包都可以直接肉眼查看为我们调试工作带来了极大的便利性，但信息透明，容易被窃取。

5. 不安全：
 1．通信使用明文（不加密），内容可能被窃听
 2．不验证通信方的身份，因此有可能遭遇伪装
 3．无法证明报文的完整性，所以有可能已遭篡改。
可以用HTTPS的方式解决，也就是通过引入SSL／TLS层，使得在安全上达到了极致。

## 4.2 HTTPS基本特性 443 = HTTP + 密文 + 验证 + 完整性

HTTPS 超⽂本安全传输协议 

HTTP：以明文的方式在网络中传输数据

HTTPS解决HTTP不安全的缺陷，在TCP和HTTP网络层之间加入了SSL／TLS安全协议，使得报文能够加密传输。

HTTPS在TCP三次握手之后，还需进行SSL／TLS的握手过程，才可进入加密报文传输。HTTP的端口号是80，HTTPS的端口号是443。

HTTPS 协议需要向CA（证书权威机构）申请数字证书，来保证服务器的身份是可信的。
1. 特点：
 - 信息加密：交互信息无法被窃取
 - 校验机制：无法篡改通信内容，篡改了就不能正常显示
 - 身份证书：证明报文的完整

2. 优点
 - 在数据传输过程中，使用秘钥加密，安全性更高
 - 可认证用户和服务器，确保数据发送到正确的用户和服务器

3. 缺点
 - 握手阶段延时较高：在会话前还需进行SSL握手
 - 部署成本高：需要购买CA证书；需要加解密计算，占用CPU资源，需要服务器配置或数目高
 
4. 加密方式
    1. 对称加密：
    只使用一个密钥，运算速度快，密钥必须保密，无法做到安全的密钥交换；

    2. 非对称加密：
    使用两个密钥，公钥可以任意分发而私钥保密，解决密钥交换问题，但速度慢。

    3. 混合加密：
    实现信息的机密性，解决窃听风险；

HTTPS采用对称加密和非对称加密结合的［混合加密］方式。

### 4.2.5 HTTPS 工作加解密流程

[](/img/computer-networking/https.png)

1. 客户端发起 HTTPS 请求，连接到服务端的 443 端口。
2. 服务端有一套数字证书（证书内容有公钥、证书颁发机构、失效日期等）。
3. 服务端将自己的数字证书发送给客户端（公钥在证书里面，私钥由服务器持有）。
4. 客户端收到数字证书之后，会验证证书的合法性。如果证书验证通过，就会生成一个随机的对称密钥，用证书的公钥加密。
5. 客户端将公钥加密后的密钥发送到服务器。
6. 服务器接收到客户端发来的密文密钥之后，用自己之前保留的私钥对其进行非对称解密，解密之后就得到客户端的密钥，然后用客户端密钥对返回数据进行对称加密，酱紫传输的数据都是密文啦。
7. 服务器将加密后的密文返回到客户端。
8. 客户端收到后，用自己的密钥对其进行对称解密，得到服务器返回的数据。

## 4.3 HTTP 请求和响应的报文组成、方法、状态码

### 4.3.1 HTTP 报文

1. 请求报文

[](/img/computer-networking/http-request.png)

```
GET /admin_ui/rdx/core/images/close.png HTTP/1.1
Accept: */*
Referer: http://xxx.xxx.xxx.xxx/menu/neo
Accept-Language: en-US
User-Agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E)
Accept-Encoding: gzip, deflate
Host: xxx.xxx.xxx.xxx
Connection: Keep-Alive
Cookie: startupapp=neo; is_cisco_platform=0; rdx_pagination_size=250%20Per%20Page; SESSID=deb31b8eb9ca68a514cf55777744e339
```

HTTP的请求报文包括：

请求行(request Line)、请求头部(Header)、 空行 和 请求数据(request data) Body 四个部分组成。


- 请求行包括：请求方法 + URL(包括参数信息) + 协议版本这些信息
```
    GET  /admin_ui/rdx/core/images/close.png  HTTP/1.1
```

- 请求头部(Header)是一个个的**key-value**值，比如
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5)
Accept: */*
Host: xxx.xxx.xxx.xxx
Connection: Keep-Alive
```

- 空行(CR+LF)：请求报文用空行表示**header和请求数据的分隔**

- 请求数据：GET方法没有携带数据， POST方法会携带一个body

2. 响应报文

[](/img/computer-networking/http-response.png)

```
HTTP/1.0 200 OK
Content-Type: text/plain
Content-Length: 137582
Expires: Thu, 05 Dec 1997 16:00:00 GMT
Last-Modified: Wed, 5 August 1996 15:55:28 GMT
Server: Apache 0.84
<html>
<body>Hello World</body>
</html>
```

HTTP的响应报文包括：状态行 Line，响应头 Header，空行 CRLF，数据(响应体)

- 状态行包括：HTTP版本号，状态码和状态值组成。
```
HTTP/1.0 200 OK
```

- 响应头类似请求头，是一系列key-value值
```
Content-Type: text/plain 实体主体的数据类型
Content-Length: 137582 实体主体的大小
Expires: Thu, 05 Dec 1997 16:00:00 GMT 响应数据资源的过期时间
Last-Modified: Wed, 5 August 1996 15:55:28 GMT 资源的最后修改时间。
Server: Apache 0.84
```

常见的请求首部有 Accept 可接收媒体资源的类型、Accept-Charset 可接收的字符集、Host 请求的主机名。

常见的响应首部有 ETag 资源的匹配信息，Location 客户端重定向的 URI。

常见的通用首部有 Cache-Control 控制缓存策略、Connection 管理持久连接。

常见的实体首部有 Content-Length 实体主体的大小、Expires 实体主体的过期时间、Last-Modified 资源的最后修改时间。

- 空行：同上，响应报文也用空行来分隔header和数据

- 响应体：响应的data，本例中是一段HTML

### 4.3.2 HTTP 方法 、GET和POST区别

1. GET:  向服务器获取资源的简单请求

2. POST：向服务器提交数据请求

3. PUT： 修改指定资源

4. DELETE： 删除URL标记的指定资源

5. CONNECT： 用于代理服务器

6. TRANCE： 主要用于回环测试

7. OPTIONS： 返回所有可用的方法

8. HEAD： 获取URL标记资源的首部
其中，POST、DELETE、PUT、GET的含义分别对应我们最熟悉的增、删、改、查。

#### 4.3.2.1 GET和POST区别

从三个方面来说明GET和POST的区别： 传参方式不同、 幂等和安全性不同、 可被缓存性不同

1. 从 HTTP 报文层面来看，GET 请求将信息放在 URL，POST 将请求信息放在请求体中。这一点使得 GET 请求携带的数据量有限，因为 URL 本身是有长度限制的，而 POST 请求的数据存放在报文体中，因此对大小没有限制。而且从形式上看，GET 请求把数据放 URL 上不太安全，而 POST 请求把数据放在请求体里想比较而言安全一些。

2. 从数据库层面来看，GET 符合幂等性和安全性，而 POST 请求不符合。这个其实和 GET/POST 请求的作用有关。按照 HTTP 的约定，GET 请求用于查看信息，不会改变服务器上的信息；而 POST 请求用来改变服务器上的信息。正因为GET 请求只查看信息，不改变信息，对数据库的一次或多次操作获得的结果是一致的，认为它符合幂等性。安全性是指对数据库操作没有改变数据库中的数据。

3. 从其他层面来看，GET 请求能够被缓存，GET 请求能够保存在浏览器的浏览记录里，GET 请求的 URL 能够保存为浏览器书签。这些都是 POST 请求所不具备的。缓存是 GET 请求被广泛应用的根本，他能够被缓存也是因为它的幂等性和安全性，除了返回结果没有其他多余的动作，因此绝大部分的 GET 请求都被 CDN 缓存起来了，大大减少了 Web 服务器的负担。

#### 4.3.2.2 GET 的长度限制是多少

HTTP中的GET方法是通过URL传递数据的，但是URL本身其实并没有对数据的长度进行限制，真正限制GET长度的是浏览器。

例如IE浏览器对URL的最大限制是2000多个字符，大概2kb左右，像Chrome、Firefox等浏览器支持的URL字符数更多，其中FireFox中URL的最大长度限制是65536个字符，Chrome则是8182个字符。
这个长度限制也不是针对数据部分，而是针对整个URL。


### 4.3.3 HTTP 状态码

```
101 切换请求协议
200 请求成功
301 请求资源永久移动，返回新URI
302 请求资源临时移动， 浏览器重定向到新的URI
400 客户端请求的语法错误，服务端无法理解
401 当前请求需要认证
403 服务器理解请求，但拒绝执行
500 服务器内部错误
```

301：永久性移动，请求的资源已被永久移动到新位置。服务器返回此响应时，会返回新的资源地址。

302：临时性性移动，服务器从另外的地址响应资源，但是客户端还应该使用这个地址。

用一个比喻，301就是嫁人的新垣结衣，302就是有男朋友的长泽雅美。


## 4.4 HTTP、 HTTPS 综合

### 4.4.1 HTTP请求的一个完整过程

- 建立 TCP 连接（之前可能还有一次DNS域名解析）
- 三次握手建立TCP完成后，客户端向服务器发送请求命令，比如 GET https://www.baidu.com?name=xx&addr=xx HTTP1.1
- 客户端发送请求头信息，发送完了header后会接着发送一个空白行，GET请求没有数据，POST请求要发送body数据
- 服务器接收到以上信息后，开始处理业务，处理完有了结果以后，服务器开始应答
- 服务器返回响应头信息，发送完response header以后，再发送一个空白行
- 然后服务器向客户端发送数据
- 发送完了服务器四次挥手关闭 TCP 连接


# 五、网络综合

## 2.1 Socket 套接字, 类似特殊的IO流(网络数据)

IO 文件流的读写 <-----> Socket 网络通信中数据流的发送与接收

Socket 一个是 网编编程的标准接口。具体来说，Socket 是一套标准，它完成了对 TCP/IP 的高度封装，屏蔽网络细节，以方便开发者更好地进行网络编程。

具体的网络进程通信中，需要确定进程间通信使用的 IP 地址 + 端口 + 协议，三者组合起来就可以称为一个Socket, 利用这个Socket提供的各种函数如:connect、bind、listen、close、accept等函数，来实现网络中进程之间的通信。

## 2.2 Session、 Cookie 概念、区别、 联系 Token

### 2.2.1 Cookie

保存在**客户端**的一小块**文本串**的数据。 客户端向服务器发起请求时， 服务端会向客户端发送一个Cookie, 客户端就把Cookie保存起来。 在客户端下次向同一服务器再次发起请求时，Cookie被携带发送到服务器。服务端可以根据这个Cookie判断用户的身份和状态。**Cookie可存储的数据量有限，一般不超过4KB.**

### 2.2.2 Session

Session与Cookie类似，都是为了存储用户相关信息。它是另一种记录客户状态的机制。不同的是cookie保存在客户端浏览器中，而session保存在服务器上。客户端浏览器访问服务器的时候，**服务器把客户端信息以某种形式记录在服务器上**，这就是session。客户端浏览器再次访问时只需要从该session中查找用户的状态。

- 优势：数据存储在服务器更加安全

- 缺陷：会占用服务器资源

### 2.2.3 联系

[](/img/computer-networking/sessionAndCookie.png)

1. 用户第一次请求服务器时，服务器根据用户的信息，**创建对应的 Session**，请求返回时将此 Session 的唯一标识信息 **SessionID** 返回给浏览器，浏览器接收到服务器返回的 SessionID 信息后，会**将此信息存入 Cookie 中**，同时 Cookie 记录此 SessionID 是**属于哪个域名**。

2. 当用户第二次访问服务器时，请求会自动判断**此域名下是否存在 Cookie 信息**，如果存在，则自动将 Cookie 信息也发送给服务端，**服务端从 Cookie 中获取SessionID**，再根据 SessionID 查找对应的 Session 信息，如果没有找到，说明用户**没有登录或者登录失效**，如果找到 Session 证明用户**已经登录**可执行后面操作。

### 2.2.4 分布式环境下Session怎么处理呢？

分布式环境下，客户端请求经过负载均衡，可能会分配到不同的服务器上，假如一个用户的请求两次没有落到同一台服务器上，那么在新的服务器上就没有记录用户状态的Session。这时候怎么办呢？

可以使用Redis等**分布式缓存**来存储Session，在多台服务器之间共享。


### 2.2.5 客户端无法使用Cookie怎么办？

有可能客户端无法使用Cookie，比如浏览器禁用Cookie，或者客户端是安卓、IOS等等。这时候怎么办？SessionID怎么存？怎么传给服务端呢？

- 禁用 Cookie 怎么存储 SessionID呢？ 可以使用客户端的本地存储，比如浏览器的sessionStorage。

- 怎么传客户端的 SessionID 给服务器呢？

1. 拼接到URL里：直接把SessionID作为URL的请求参数
2. 放到请求头里：把SessionID放到请求的Header里，比较常用。


### Token
https://juejin.cn/post/6945808765740384269



## keep-alive http1.0 http1.x http2 tcp grpc rpc

### 向一个不存的Ip地址发送连接请求，向一个不存在的端口发送连接请求，会发生什么？ rst todo 路由表（下一跳） arp表（记录ip，mac的对应关系）

1. 向一个不存的Ip地址发送连接请求
- 在同一个局域网、网段
客户端发送arp请求，广播查询局域网内的ip地址，目标ip地址不存在，接收不到arp响应，客户端无法拿到目标ip地址的mac地址，syn报文无法发送出去。

- 不在同一个局域网、网段
将syn报文交给路由进行转发，目标ip地址在网络中不存在接收不到ack，超时触发syn重传，syn发送次数达到最大次数后，客户端的连接释放。

为什么这种情况客户端的 SYN 报文可以发出来？ 客户端syn -> 客户端路由器 -> 目标网段路由器 -> 目标ip

因为当目标 IP 地址和客户端 IP 地址不在同一个局域网时，

客户端会将syn报文发送给路由器，交给路由表来查询转发给目标ip网段的路由器，到达目标ip路由器后，该路由器找不到目标ip地址的mac地址，无法建立连接。



这时候数据链路层的 arp 请求，会广播询问 IP 地址（路由器 IP 地址）是谁的，路由器发现是自己的 IP 地址，于是就会将自己的 MAC 地址告诉客户端。

然后客户端的网络报文中 MAC 头的「目标 MAC 地址」填入的就是路由器的 MAC 地址，于是 SYN 报文就可以发送出去了。

由于目标 MAC 地址是路由器的，所以就会被路由器接收，然后路由器继续通过路由表的判断，转发给下一个路由器，直到找到目标设备。

2. 向一个不存在的端口发送连接请求 
目标ip主机发送rst,断开连接


### 反向代理 正向代理

正向代理 (clash, v2ray)， 由客户端部署，向服务端隐藏客户端真实身份，帮助客户端突破访问限制。

反向代理（nginx）， 由服务端部署，向客户端隐藏服务端的真实地址，防止web ddos攻击, 提供负载均衡、安全防护作用。

正向代理和反向代理的区别

虽然正向代理服务器和反向代理服务器所处的位置都是客户端和真实服务器之间，所做的事情也都是把客户端的请求转发给服务器，再把服务器的响应转发给客户端，但是二者之间还是有一定的差异的。

1、正向代理其实是客户端的代理，帮助客户端访问其无法访问的服务器资源。
   反向代理则是服务器的代理，帮助服务器做负载均衡，安全防护等。

2、正向代理一般是客户端架设的，比如在自己的机器上安装一个代理软件。
   而反向代理一般是服务器架设的，比如在自己的机器集群中部署一个反向代理服务器。

3、正向代理中，服务器不知道真正的客户端到底是谁，以为访问自己的就是真实的客户端。
   而在反向代理中，客户端不知道真正的服务器是谁，以为自己访问的就是真实的服务器。

4、正向代理和反向代理的作用和目的不同。正向代理主要是用来解决访问限制问题。
   而反向代理则是提供负载均衡、安全防护等作用。二者均能提高访问速度。

正向代理也可以用于控制和监控互联网流量的使用情况。

### api 接口限流 权限身份验证 

