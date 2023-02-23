---
title: ospp记录（四）结题报告
date: 2022-09-06 19:47:43
categories: 
 - ospp记录
---

# 【结题报告】Nacos-CoreDNS模块支持以长连接访问Nacos服务端

## 目录
[TOC]

## 项目信息

### 项目名称：Nacos-CoreDNS模块支持以长连接访问Nacos服务端
### 项目产出：

- [x]  1. 设计出Nacos CoreDNS模块支持gRPC的方案，输出详细设计文档； 
- [x]  2. 根据设计文档，对Nacos CoreDNS模块进行开发；
- [x]  3. 提供新Nacos CoreDNS模块的使用示例和文档。 
### 方案描述：
当前 Nacos-CoreDNS-Plugin 插件是通过HTTP短连接方式调用Nacos服务端的 API 来请求获取nacos服务端的资源信息。 而在nacos版本v2.x后，原来v1.x版本的API已经被移除，替换成了建立gRPC连接的方式通过gRPC请求来访问获取nacos服务端的资源信息。
因此本项目的方案可以参考Nacos-go-sdk与Nacos服务器的通信方式，在Nacos-coredns-plugin内导入Nacos-sdk-go相关功能，封装成新的grpc通信模块，实现nacos-coredns插件与nacos服务器的通信。
例如，通过nacos-go-sdk来调用GetAllServicesInfo、GetService等方法，就能获取所有服务或某个具体服务的信息（ip、port...），这些数据可以覆盖nacos v1版本api传输的数据，因此只需要对从nacos服务端获取的数据转成对应coredns插件需要的数据结构即可。

#### 核心方法

1.  构建客户端：通过在coredns插件中导入nacos-go-sdk/v2包，搭建一个nacos-coredns插件和nacos服务通信的客户端 
2.  根据插件的资源需求，封装sdk方法， 完成通信中的数据交换：
   - GetAllServicesInfo: 请求获取Nacos服务端里注册的所有服务名
   - GetService:  请求获取Nacos服务端某个服务的具体信息
   - Subscribe:   订阅Nacos服务端某个服务
   - Unsubsrcibe: 取消订阅Nacos服务端某个服务
   - Callback:    当Nacos服务端的订阅服务发生改变时，通过回调函数更新客户端的服务数据
   - HasSubcribed: 记录当前服务是否订阅，避免重复订阅
3.  替换原来插件的数据结构：原来的nacos-coredns插件的数据结构与新版nacos服务端gRPC请求返回的数据结构冲突不兼容，需要放弃原来的数据结构，更新为新版的数据结构。

**grpc客户端的类设计图**
![NacosGrpcClient.drawio.png](https://cdn.nlark.com/yuque/0/2022/png/29425667/1664196977944-f4258097-3823-4984-8814-4cae3ed8cdb1.png)

#### grpc通信流程设计
![grpc-design.png](https://cdn.nlark.com/yuque/0/2022/png/29425667/1664196982731-98f47454-b143-4968-a2e8-223d287d106e.png)
1、启动nacos-coredns插件时，同时启动插件与nacos服务器的grpc通信客户端（nacos_grpc_client）。
2、grpc通信客户端调用了Nacos-go-sdk/v2中实现的方法，从nacos服务器集群中获取一个服务器的IP地址和端口并建立TCP连接。HTTP/2下，同个域名只需要占用一个 TCP 连接，使用一个连接并行发送多个请求和响应。
3、nacos-coredns插件向Nacos服务器请求资源时，通过grpc通信客户端来调用nacos-go-sdk/v2封装的GetAllServicesInfo、GetService等方法来获取所有服务或某个具体服务的信息详情（ip、port...）。
4、grpc通信客户端将从nacos服务器里获取到的数据存入nacos-coredns插件的数据缓存中，待插件处理DNS请求时输出数据。
5、对grpc通信客户端设置 超时时间 与 重试次数 等措施来避免调用超时、 阻塞等情况。

### 方案具体实现：
#### 一、 构建客户端
在 Nacos-CoreDNS-Plugin 插件中导入nacos-go-sdk/v2包， 来与要访问的nacos服务端集群建立gRPC连接。
与nacos服务端建立gRPC需要两个参数  **clientConfig** 和  **serverConfig**. 

- clientConfig 是针对本项目作为向服务端请求资源的客户端 来配置 对nacos服务端的 NamespaceId 请求超时TimeoutMs 日志目录LogDir 数据缓存目录CacheDir
```go
nacosGrpcClient.clientConfig = *constant.NewClientConfig(
        constant.WithNamespaceId(namespaceId),
        constant.WithTimeoutMs(5000),
        constant.WithLogDir(LogPath),
        constant.WithCacheDir(CachePath),
        constant.WithNotLoadCacheAtStart(true),
        constant.WithUpdateCacheWhenEmpty(true),
        constant.WithLogLevel("debug"),
)
```

- serverConfig 指定服务端集群的Ip地址和端口
```go
serverConfigs := make([]constant.ServerConfig, len(serverHosts))
for i, serverHost := range serverHosts {
        serverIp := strings.Split(serverHost, ":")[0]
        serverPort, err := strconv.Atoi(strings.Split(serverHost, ":")[1])
        if err != nil {
            NacosClientLogger.Error("nacos server host config error!", err)
        }
        serverConfigs[i] = *constant.NewServerConfig(
            serverIp,
            uint64(serverPort),
            constant.WithScheme("http"),
            constant.WithContextPath("/nacos"),
        )

    }
nacosGrpcClient.serverConfigs = serverConfigs
```

- 配置完成后， 连接建立， 通过此客户端来进行通信
```go
nacosGrpcClient.grpcClient, err = clients.NewNamingClient(
    vo.NacosClientParam{
        ClientConfig:  &nacosGrpcClient.clientConfig,
        ServerConfigs: nacosGrpcClient.serverConfigs,
    },
)
```
#### 二、 客户端的主要功能
#### 根据插件的资源需求，封装sdk方法， 完成通信中的数据交换。

1. GetAllServicesInfo:  对应v1版本的API(/v1/ns/api/allDomNames)，通过封装sdk的方法，获取在nacos里注册的所有服务名。	
```go
func (ngc *NacosGrpcClient) GetAllServicesInfo() []string {
    var pageNo = uint32(1)
    var pageSize = uint32(100)
    var services []string

    pageServiceList, _ := ngc.grpcClient.GetAllServicesInfo(vo.GetAllServiceInfoParam{
        NameSpace: ngc.namespaceId,
        PageNo:    pageNo,
        PageSize:  pageSize,
    })
    services = append(services, pageServiceList.Doms...)

    // 如果当前页数服务数满了, 继续查找添加下一页
	for pageNo++; len(pageServiceList.Doms) >= int(pageSize); pageNo++ {
        pageServiceList, _ = ngc.grpcClient.GetAllServicesInfo(vo.GetAllServiceInfoParam{
            NameSpace: ngc.namespaceId,
            PageNo:    pageNo,
            PageSize:  pageSize,
        })
        services = append(services, pageServiceList.Doms...)
    }
    return services
}
```

2. GetService:  对应v1版本的API(/v1/ns/api/srvIPXT)，输入服务名，通过gRPC请求获该服务的具体信息。
```go
func (ngc *NacosGrpcClient) GetService(serviceName string) model.Service {
    service, _ := ngc.grpcClient.GetService(vo.GetServiceParam{
        ServiceName: serviceName,
    })
    if service.Hosts == nil {
        NacosClientLogger.Warn("empty result from server, dom:" + serviceName)
    }
    return service
}
```

3. Subscribe:  订阅Nacos服务端某个服务， 封装sdk中订阅服务的方法，输入服务名，通过gRPC连接完成对该服务的订阅来更新服务数据。
```go
func (ngc *NacosGrpcClient) Subscribe(serviceName string) error {
    if ngc.HasSubcribed(serviceName) {
        NacosClientLogger.Info("service " + serviceName + " already subsrcibed.")
        return nil
    }
    param := &vo.SubscribeParam{
        ServiceName:       serviceName,
        GroupName:         "",
        SubscribeCallback: ngc.Callback,
    }
    if err := ngc.grpcClient.Subscribe(param); err != nil {
        NacosClientLogger.Error("service subscribe error " + serviceName)
        return err
    }

    defer ngc.SubscribeMap.DLock.Unlock()
    ngc.SubscribeMap.DLock.Lock()
    ngc.SubscribeMap.Data[serviceName] = true

    return nil
}
```

4. Unsubsrcibe:  取消订阅Nacos服务端某个服务， 封装了sdk中取消订阅服务的方法。当服务下线时，通过gRPC连接来取消该服务的订阅。
```go
func (ngc *NacosGrpcClient) Unsubsrcibe(serviceName string) error {
    if !ngc.HasSubcribed(serviceName) {
        NacosClientLogger.Info("service " + serviceName + " already unsubsrcibed.")
        return nil
    }
    param := &vo.SubscribeParam{
        ServiceName:       serviceName,
        GroupName:         "",
        SubscribeCallback: ngc.Callback,
    }
    if err := ngc.grpcClient.Unsubscribe(param); err != nil {
        NacosClientLogger.Error("service unsubscribe error " + serviceName)
        return err
    }

    defer ngc.SubscribeMap.DLock.Unlock()
    ngc.SubscribeMap.DLock.Lock()
    ngc.SubscribeMap.Data[serviceName] = false

    return nil
}
```

5. Callback:  当Nacos服务端的订阅服务发生改变时，通过回调函数更新客户端的服务数据。
```go
func (ngc *NacosGrpcClient) Callback(instances []model.Instance, err error) {
    //服务下线,更新实例数量为0
    if len(instances) == 0 {
        for serviceName, _ := range AllDoms.Data {
            if service := ngc.GetService(serviceName); len(service.Hosts) == 0 {
                ngc.nacosClient.GetDomainCache().Set(serviceName, service)
                ngc.Unsubsrcibe(serviceName)
            }
        }
        return
    }
    serviceName := strings.Split(instances[0].ServiceName, SEPERATOR)[1]
    oldService, ok := ngc.nacosClient.GetDomainCache().Get(serviceName)
    if !ok {
        NacosClientLogger.Info("service not found in cache " + serviceName)
        service := ngc.GetService(serviceName)
        ngc.nacosClient.GetDomainCache().Set(serviceName, service)
    } else {
        service := oldService.(model.Service)
        service.Hosts = instances
        service.LastRefTime = uint64(CurrentMillis())
        ngc.nacosClient.GetDomainCache().Set(serviceName, service)
    }
    NacosClientLogger.Info("serviceName: "+serviceName+" was updated to: ", instances)
}
```

6. HasSubcribed:  记录当前服务是否订阅，避免重复订阅。
```go
func (ngc *NacosGrpcClient) HasSubcribed(serviceName string) bool {
    defer ngc.SubscribeMap.DLock.RUnlock()
    ngc.SubscribeMap.DLock.RLock()
    return ngc.SubscribeMap.Data[serviceName]
}
```
#### 三、 替换原来插件的数据结构
将从nacos服务器里获取到的数据转成对应nacos-coredns插件需要的数据结构
将v1版本的数据结构 **Domain** 替换为 **Service**, 并更新 **Instance** 的结构。
旧的定义：

```go
type Domain struct {
    Name          string `json:"dom"`
    Clusters      string
    CacheMillis   int64
    LastRefMillis int64
    Instances     []Instance `json:"hosts"`
    Env           string
    TTL           int
}
```
```go
type Instance struct {
    IP         string
    Port       int
    Weight     float64
    Valid      bool
    Unit       string
    AppUseType string
    Site       string
}
```
新的替换：
```go
type Service struct {
    CacheMillis              uint64     `json:"cacheMillis"`
    Hosts                    []Instance `json:"hosts"`
    Checksum                 string     `json:"checksum"`
    LastRefTime              uint64     `json:"lastRefTime"`
    Clusters                 string     `json:"clusters"`
    Name                     string     `json:"name"`
    GroupName                string     `json:"groupName"`
    Valid                    bool       `json:"valid"`
    AllIPs                   bool       `json:"allIPs"`
    ReachProtectionThreshold bool       `json:"reachProtectionThreshold"`
}
```
```go
type Instance struct {
    InstanceId                string            `json:"instanceId"`
    Ip                        string            `json:"ip"`
    Port                      uint64            `json:"port"`
    Weight                    float64           `json:"weight"`
    Healthy                   bool              `json:"healthy"`
    Enable                    bool              `json:"enabled"`
    Ephemeral                 bool              `json:"ephemeral"`
    ClusterName               string            `json:"clusterName"`
    ServiceName               string            `json:"serviceName"`
    Metadata                  map[string]string `json:"metadata"`
    InstanceHeartBeatInterval int               `json:"instanceHeartBeatInterval"`
    IpDeleteTimeout           int               `json:"ipDeleteTimeout"`
    InstanceHeartBeatTimeOut  int               `json:"instanceHeartBeatTimeOut"`
}
```
### 时间规划

- [x] 7.01 - 7.14  复用Nacos-Sdk-Go，构建一个简易的Nacos-go客户端与Nacos服务器实现gRPC的通信方式，来熟悉Nacos的go开发，改进设计文档。  
- [x] 7.15 - 7.31  借助前面的开发文档和经验，尝试在Nacos-CoreDNS-plugin中添加 grpc客户端模块，建立与 Nacos服务端的gRPC通信。
- [x] 8.01 - 8.14  对 Nacos-CoreDNS 插件与Nacos服务端的连接进行细节的优化，保证连接的稳定性。
- [x] 8.15 - 8.30  编写单元测试，对新的连接进行性能测试，主要是对比同一个接口在gRPC连接和短连接两种模式下的响应时间和吞吐量进行压力测试。  
- [x] 9.01 - 9.14  编写新Nacos CoreDNS模块的使用示例和文档。  
- [x] 9.15 - 9.30  对整个项目进行梳理，提交PR，编写项目终期报告。
## 项目总结
### 遇到的问题及解决方案：
#### 1. nacos旧版本升级到新版本后，原来的API被移除了。
原来的 Nacos-CoreDNS-Plugin 插件是通过HTTP短连接方式调用Nacos服务端的 API 来请求获取nacos服务端的资源信息。 而在nacos版本v2.x后，原来v1.x版本的API已经被移除，替换成了建立gRPC连接的方式通过gRPC请求来访问获取nacos服务端的资源信息。 因此，可以参考Nacos-go-sdk提供的与Nacos服务器的通信方法，在Nacos-coredns-plugin内导入Nacos-sdk-go相关功能，封装成新的grpc通信模块，实现nacos-coredns插件与nacos服务器的通信。
####  2. 数据缓存问题
原来coredns插件的服务数据默认是缓存在 /root/nacos-go-client-cache/ 目录中，且每次更新数据都会将数据写入到文件中，造成的io资源消耗较大。
而nacos-sdk-go中自带了对服务的缓存默认是在 /tmp/nacos/cache/ 目录中，这些缓存的数据都是在插件启动的时候加载的，两者的功能产生了重叠。因此，将原来的nacos-coredns-plugin的缓存功能移除，让nacos-sdk-go管理服务数据的缓存。 

#### 3. 数据更新问题
目前nacos-coredns-plugin数据的更新是通过两个goruntime定时向服务器请求来更新数据, 当服务数据频繁变化时，无法及时更新客户端的数据。
<div align="center"> 
<img src="https://cdn.nlark.com/yuque/0/2022/png/29425667/1658123188046-9eba3156-f960-415f-bd84-68a586dbc189.png#crop=0&crop=0&crop=1&crop=1&id=GKReH&originHeight=711&originWidth=841&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=" style="zoom: 80%; align:center" ></img>
</div>
nacos-sdk-go中提供了Subscribe服务订阅的功能。对某个服务进行订阅后，服务的实例发生改变时会调用客户端定义的回调函数callback。因此，将数据更新的流程调整为：定时从服务器获取所有服务名, 当某个服务接受到DNS请求时，对此服务进行订阅。 当Nacos服务端的订阅服务发生改变时，通过回调函数更新客户端的服务数据。 

####  4. 编译问题
coredns v1.6.7 与 nacos-sdk-go/v2 的grpc版本不兼容， 编译时会产生报错。
将 nacos-coredns-plugin 原来的 coredns v1.6.7 版本更新到最新的v1.9.3版本，解决原来coredns与nacos-sdk-go的 gRPC版本冲突问题。 

### 项目测试：
#### 测试用例
在原来的v1.6.7分支上，修改2个测试用例，新增5个测试用例

1. 测试用例一：TestNacosClient_getAllServiceNames
● 预期结果：获取Nacos服务端里注册的所有服务名并存入AllDoms
● 实际结果：成功获取Nacos服务端里注册的所有服务名并存入AllDoms
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235900753-b4c1b719-bd97-484d-85c3-7b4cc2857858.png#crop=0&crop=0&crop=1&crop=1&id=o7c3j&originHeight=100&originWidth=800&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

2. 测试用例二：TestNacosClient_getDomNow
● 预期结果：获取Nacos服务端里某个服务的具体信息并存入缓存中
● 实际结果：成功获取Nacos服务端里某个服务的具体信息并存入缓存中
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235907742-ff276893-12f7-422d-b68b-11de9009295f.png#crop=0&crop=0&crop=1&crop=1&id=SWIpv&originHeight=105&originWidth=799&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)
3. 测试用例三：TestGetAllServicesInfo
● 预期结果：gRPC请求获取Nacos服务端里注册的所有服务名
● 实际结果：成功通过gRPC请求获取Nacos服务端里注册的所有服务名
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235912610-bb19fa61-93a4-4e7e-a426-883ec6ac702d.png#crop=0&crop=0&crop=1&crop=1&id=IZjR3&originHeight=101&originWidth=801&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

4. 测试用例四：TestGetService
● 预期结果：gRPC请求获取Nacos服务端某个服务的具体信息
● 实际结果：成功通过gRPC请求获取Nacos服务端某个服务的具体信息
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235917042-499d4924-c2b3-4f08-9cc3-7f7439904553.png#crop=0&crop=0&crop=1&crop=1&id=MH0ma&originHeight=95&originWidth=799&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

5. 测试用例五：TestSubscribe
● 预期结果：gRPC订阅Nacos服务端某个服务
● 实际结果：成功通过gRPC订阅Nacos服务端某个服务
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235925262-741dbe46-6a47-47dc-afbc-83f08403853b.png#crop=0&crop=0&crop=1&crop=1&id=dGoe9&originHeight=88&originWidth=800&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

6. 测试用例六：TestCallback
● 预期结果：当Nacos服务端服务发生改变时，通过回调函数更新客户端的服务数据
● 实际结果：当Nacos服务端服务发生改变时，成功通过回调函数更新客户端的服务数据
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235933413-c05baf72-43a3-4a0d-8f99-a817cd6cc6f9.png#crop=0&crop=0&crop=1&crop=1&id=ApssP&originHeight=97&originWidth=801&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

7. 测试用例七：TestNacosParse
● 预期结果：通过配置文件配置Nacos服务器的 NamespaceId 和 ip地址和端口 .
● 实际结果：成功配置Nacos服务器的 NamespaceId 和 ip地址和端口 .
![](https://cdn.nlark.com/yuque/0/2022/png/29425667/1663235941664-68c7fca4-c643-4b0a-bacc-b6bee6f0f2db.png#crop=0&crop=0&crop=1&crop=1&id=mwKYF&originHeight=163&originWidth=828&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

**所有测试用例运行结果**
```
=== RUN   TestDnsCache_Updated
    dns_cache_test.go:26: Out of date test is passed
    dns_cache_test.go:32: Updated is passed.
--- PASS: TestDnsCache_Updated (0.00s)
=== RUN   TestGet
    httpclient_test.go:40: Success to test http client get
--- PASS: TestGet (0.00s)
=== RUN   TestNacosClient_GetDomain
--- PASS: TestNacosClient_GetDomain (0.00s)
=== RUN   TestNacosClient_getAllServiceNames
    nacos_client_test.go:75: Get all serviceName from servers passed
--- PASS: TestNacosClient_getAllServiceNames (0.05s)
=== RUN   TestNacosClient_getServiceNow
    nacos_client_test.go:100: Get all servicesInfo from servers passed
--- PASS: TestNacosClient_getServiceNow (2.80s)
=== RUN   TestDomain_SrvInstances
    nacos_domain_test.go:30: Domain.srvInstances weight passed.
    nacos_domain_test.go:37: Domain.srvInstances valid passed.
--- PASS: TestDomain_SrvInstances (0.00s)
=== RUN   TestGetAllServicesInfo
    nacos_grpc_client_test.go:23: GrpcClient get all servicesInfo passed
--- PASS: TestGetAllServicesInfo (0.03s)
=== RUN   TestGetService
    nacos_grpc_client_test.go:39: GrpcClient get service passed
--- PASS: TestGetService (0.03s)
=== RUN   TestSubscribe
    nacos_grpc_client_test.go:54: GrpcClient subscribe service passed
--- PASS: TestSubscribe (0.03s)
=== RUN   TestCallback
    nacos_grpc_client_test.go:181: GrpcClient Service SubscribeCallback passed
--- PASS: TestCallback (0.00s)
=== RUN   TestServerManager_NextServer
    server_manager_test.go:29: ServerManager.NextServer test is passed.
--- PASS: TestServerManager_NextServer (0.00s)
=== RUN   TestServerManager_RefreshServerListIfNeed
    server_manager_test.go:39: ServerManager.RefreshServerListIfNeed test is passed.
--- PASS: TestServerManager_RefreshServerListIfNeed (0.00s)
=== RUN   TestNacosParse
init nacos plugin...
init nacos client.
    setup_test.go:54: Passed
--- PASS: TestNacosParse (1.18s)
=== RUN   TestUDPServer_StartServer
    udp_server_test.go:43: Udp server test passed.
--- PASS: TestUDPServer_StartServer (0.02s)
=== RUN   TestTryDecompressData
    util_and_comms_test.go:32: Gzip test is passed.
--- PASS: TestTryDecompressData (0.00s)
PASS
ok  	nacos-coredns-plugin/nacos	4.624s
```

#### 压力测试

1.  测试机器配置
腾讯云轻量应用服务器：CPU2核 内存2G 带宽4M。一般而言，CoreDNS比较吃网卡和CPU，对于硬盘IO的要求并不算特别高（主要取决于写日志的量），对内存占用较低。 
2.  测试工具
本次测试使用bind9出品的一款DNS服务器性能测试的工具queryperf，对DNS服务器进行压测，并对DNS服务器性能进行评估。 
3.  测试方法
使用 queryperf 来对 Coredns-Nacos-Plugin 进行DNS请求，解析在Nacos服务端注册的服务域名。
● 本次测试使用的Nacos服务端注册了1000个服务, 共10000个服务实例。 

**v1 版本：Nacos v1.x + Coredns v1.6.7**
● 50000条DNS请求： 三次测试， 平均qps为 209
```
[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file
  
  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries
  
  RTT max:         	0.428648 sec
  RTT min:              0.000030 sec
  RTT average:          0.011961 sec
  RTT std deviation:    0.016171 sec
  RTT out of range:     0 queries
  
  Percentage completed: 100.00%
  Percentage lost:        0.00%
  
  Started at:           Thu Sep 22 15:49:44 2022
  Finished at:          Thu Sep 22 15:53:53 2022
  Ran for:              249.121087 seconds
  
  Queries per second:   200.705611 qps
```
```
[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file
  
  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries
  
  RTT max:         	0.485871 sec
  RTT min:              0.000357 sec
  RTT average:          0.011313 sec
  RTT std deviation:    0.012731 sec
  RTT out of range:     0 queries
  
  Percentage completed: 100.00%
  Percentage lost:        0.00%
  
  Started at:           Thu Sep 22 16:24:04 2022
  Finished at:          Thu Sep 22 16:28:10 2022
  Ran for:              245.988585 seconds
  
  Queries per second:   203.261464 qps
```
```
[Status] Testing complete

Statistics:
  
  Parse input file:     once
  Ended due to:         reaching end of file
  
  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries
  
  RTT max:         	0.082733 sec
  RTT min:              0.000019 sec
  RTT average:          0.006520 sec
  RTT std deviation:    0.001705 sec
  RTT out of range:     0 queries
  
  Percentage completed: 100.00%
  Percentage lost:        0.00%
  
  Started at:           Wed Sep 22 20:43:30 2022
  Finished at:          Wed Sep 22 20:47:12 2022
  Ran for:              222.443603 seconds
  
  Queries per second:   224.776075 qps
```


**v2版本： Nacos2.1.1 + Coredns 1.9.3**
50000条DNS请求，三次测试平均qps为：467
```
[Status] Testing complete

Statistics:
  
  Parse input file:     once
  Ended due to:         reaching end of file
  
  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries
  
  RTT max:         	0.048039 sec
  RTT min:              0.004723 sec
  RTT average:          0.006745 sec
  RTT std deviation:    0.001731 sec
  RTT out of range:     0 queries
  
  Percentage completed: 100.00%
  Percentage lost:        0.00%
  
  Started at:           Thu Sep 22 14:48:29 2022
  Finished at:          Thu Sep 22 14:50:17 2022
  Ran for:              107.771145 seconds
  
  Queries per second:   463.946078 qps
```
```
[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:         	0.041432 sec
  RTT min:              0.003126 sec
  RTT average:          0.005235 sec
  RTT std deviation:    0.001552 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Thu Sep 22 14:52:01 2022
  Finished at:          Thu Sep 22 14:53:49 2022
  Ran for:              107.977801 seconds

  Queries per second:   463.058143 qps
```
```
[Status] Testing complete

Statistics:
  
  Parse input file:     once
  Ended due to:         reaching end of file
  
  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries
  
  RTT max:         	0.039539 sec
  RTT min:              0.000980 sec
  RTT average:          0.005502 sec
  RTT std deviation:    0.001641 sec
  RTT out of range:     0 queries
  
  Percentage completed: 100.00%
  Percentage lost:        0.00%
  
  Started at:           Thu Sep 22 15:01:28 2022
  Finished at:          Thu Sep 22 15:03:13 2022
  Ran for:              104.918484 seconds
  
  Queries per second:   476.560450 qps
```
#### 测试总结：
经过以上的单元测试和压力测试，新版本的nacos-coredns-plugin插件，在新增的与nacos服务端建立gRPC长连接的功能支持下，插件表现稳定，且DNS请求的 qps 从 209 提升到 467， 得到了接近 223% 的性能增长。
### 项目完成质量：
**1． 技术方案评价**
本次项目致力于让Nacos-CoreDNS模块支持以gRPC长连接方式访问Nacos服务端，具有一定的难度。但是在经过导师指导和讨论后，逐步完成了方案的优化，使得方案的设计更有可靠性和完善性。由于前期技术方案进行了比较严格的分析和策划，所以相对后期的实现而言，改动较少，提高了开发效率；
**2．项目质量评价**
经过比较严密的稳定性测试和压力测试，整个插件表现稳定，可以很好的完成题目给的需求。本项目模块化独立开发，与其他模块耦合度小，较为容易进行维护。此插件使用golang语言编写，具有良好的跨平台可移植性。此外，开发进度也能够按照前期的时间规划进行，按时提交了项目产出。
### 与导师沟通及反馈情况：
由于对这个项目比较感兴趣，所以在项目公布早期就与导师进行了沟通联系。在与导师沟通的过程中，得到了许多有用的反馈，帮助我了解了整个项目的详情细节。同时导师也给我了许多建议来对方案进行优化改进。可以说，整个过程中，与指导老师的沟通情况非常的默契。当我遇到困难和问题的时候，指导老师可以主动地为我解决问题，而且还会为我提出更好的建议。我所提出合理的意见，老师也会采取。

### 我的收获
虽然此次项目时间只有三个月，在这期间不一定会让一个人有着翻天覆地的变化，但变化就是这样一点一点产生的，同时也感觉有很大的收获，也帮助找出了自己的不足和需要改进的地方。在遇到问题虚心请教后，从导师的身上能学到自己没有的东西，每一次都会使我更接近成功。还有学会了在开发中与人的合作与交流。
在这个项目之前，我对待开发方案和文档这些东西会不太注重，写得比较粗略。但是通过这个项目，我体会到有效详细的方案设计和开发文档，可以很大的提高开发效率，保证项目的可行性和可维护性。
代码风格要规范，之前写代码，我都是不怎么去注意代码风格和写代码的规范，都是稍微想一下就直接开始写代码了。注释也很少用，总感觉我们自己写的代码，我们怎么会不知道它做了些什么事呢 ？总觉得我们自己写的代码我们怎么会不知道它是用来做什么的呢。但通过这次项目，我体会到保持规范统一的代码风格的重要性，可以保证代码的可读性，让别人更容易理解自己写的代码。
我也借助到这个机会，可以参与开源项目中，积累了相关经验、学习到新的知识。为日后继续参与更多开源项目提供一个经验借鉴。此外我对Nacos非常感兴趣，希望项目结束后也能在Nacos其他方面做一点点贡献。  
