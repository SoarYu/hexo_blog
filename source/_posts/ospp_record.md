---
title: 期末汇报
date: 2022-07-11 21:17:00
categories: 
 - nacos
---

0712进展更新

已按照计划，通过docker部署了nacos2.1.0服务端。然后使用Nacos-Sdk-Go搭建了nacos的go客户端，并实现了go客户端与Nacos服务器的gRPC通信和资源获取。

目前已根据实践改进了nacos-coredns插件的设计文档，下一步尝试在Nacos-CoreDNS-plugin中添加 grpc 客户端模块，实现从 Nacos 服务端的资源获取。

疑问：现在nacos的go-sdk查询nacos服务端里的所有服务时需要输入分组名(groupName)，如果不指定分组则查询的是默认分组里的所有服务。请问有没有方法或api可以获取nacos服务器里的所有分组？
或者查询所有服务列表时，可以获取所有分组里的所有服务？
目前请求服务实例的参数需要输入服务名和服务所在分组(groupName)，有没有request仅需要输入服务名就能查询包含该服务的分组


nacos里注册的服务通过分组(groupName)来隔离的，我使用nacos的go-sdk查询nacos服务端里的所有服务时需要输入分组名(groupName), 如果不指定分组的话，则查询到的是默认分组里的所有服务。如果客户端不知道nacos服务的分组名的话，怎么获取所有分组的服务列表？


0715更新
1、初步实现nacos-coredns插件中的grpc通信模块
目前已成功在nacos-coredns-plugin的v1.6.7分支上加入了与nacos服务端通信的grpc客户端模块。在coredns v1.6.7导入nacos-sdk-go/v2包后，会将coredns的go.mod中 goole.golang.org/grpc v1.26.0 更新为 v1.36.1，编译时会报错不兼容。 通过 replace 指令，将旧的库地址，替换为新的库后可以成功编译。
![](/img/ospp_record/grpc.png)

暂时对Nacos-coredns-plugin中的Domain数据结构进行了保留，调整，通过从nacos服务器获取的model.Service转json再转Domain的方式，这样对原来代码的改动最小，后期会继续优化成直接使用model.Service。
![](/img/ospp_record/getService.png)
如果直接用nacos-sdk-go中的model.Service数据结构，原来nacos-coredns-plugin的Domain是直接弃用了吗？



2、缓存问题
原来coredns的服务数据是缓存在 /root/nacos-go-client-cache/目录中，而nacos-sdk-go自带了对服务的缓存默认是在 /tmp/nacos/cache/ 目录中，这些缓存的数据都是在插件启动的时候加载的，两者的功能产生了重叠。原来的nacos-coredns-plugin的缓存功能要保留吗，是否需要让nacos-sdk-go管理服务数据的缓存。
![](/img/ospp_record/cache_dir.png)


3、数据更新问题
目前nacos-coredns-plugin数据的更新是通过两个goruntime函数定时向服务器请求来更新数据。
![](/img/ospp_record/go_func.png)

nacos-sdk-go中提供了服务订阅的功能。对某个服务进行订阅后，服务的实例发生改变时会调用客户端定义的回调函数callback。
因此，我想到可以优化数据更新的流程为
1、定时从服务器获取所有服务名后
2、对获取到的所有服务进行订阅
3、订阅后，当服务发生改变时通过回调函数来更新服务数据


# 0723更新

