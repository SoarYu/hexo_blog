---
title: nacos-coredns-plugin 详细设计
date: 2022-07-06 19:47:43
categories: 
 - nacos
---
## 核心方法

目前 nacos-coredn 插件与 nacos 服务端通信的API在 nacos2.x 版本被移除了。请教了导师后发现可以利用目前nacos-go-sdk中实现的nacos client和server通信，从nacos client获取数据转成对应的数据结构就可以，不需要api来进行数据传输。因此项目方案是参考Nacos-go-sdk与Nacos服务器的通信方式，在Nacos-coredns-plugin内导入Nacos-sdk-go相关功能，封装成新的grpc通信模块，实现与与Nacos服务器的通信。例如，通过nacos-go-sdk来调用GetAllServicesInfo、GetService等方法，就能获取所有服务或某个具体服务的信息（ip、port...），这些数据看可以覆盖旧api获取的数据，因此只需要对从nacos client获取数据转成对应coredns插件需要的数据结构即可。

目前的方案为：

### 1、通过在coredns插件中导入nacos-go-sdk/v2包，搭建一个能跟nacos服务器通信的客户端

``` go
    //创建coredns插件客户端配置
    clientConfig := *constant.NewClientConfig(
		constant.WithNamespaceId(""), 
		constant.WithTimeoutMs(5000),
		constant.WithNotLoadCacheAtStart(true),
		constant.WithLogDir("/tmp/nacos/log"),
		constant.WithCacheDir("/tmp/nacos/cache"),
		constant.WithLogLevel("debug"),
	)
	//创建nacos服务端配置
	serverConfigs := []constant.ServerConfig{
		*constant.NewServerConfig(
			"127.0.0.1",
			8848,
			constant.WithScheme("http"),
			constant.WithContextPath("/nacos"),
		),
	}
	// 创建 coredns插件 和 nacos服务端 的通信配置
	nacosClient, _ := clients.NewNamingClient(
		vo.NacosClientParam{
			ClientConfig:  &clientConfig,
			ServerConfigs: serverConfigs,
		},
	)
```

### 2、利用sdk里提供的方法从nacos服务器请求数据

获取nacos里注册的所有服务
``` go
    service, err := nacosClient.GetAllServicesInfo(vo.GetAllServiceInfoParam{
        NameSpace: "",        
        GroupName: "group-a",
        PageNo:    1,
        PageSize:  10,
    })
```
![获取所有服务](/img/plugin-details/getAllService.png)


获取nacos里注册的某个服务的详细信息
``` go
    service, err := nacosClient.GetService(vo.GetServiceParam{
		ServiceName: "demo.go",
		GroupName:   "group-a",
		Clusters:    []string{"cluster-a"},
	})
```
![服务的详细信息](/img/plugin-details/getService.png)


### 3、将从nacos服务器里获取到的数据转成对应nacos-coredns插件需要的数据结构

nacos-coredns插件主要需要的数据结构
``` go
type Domain struct {
	Name          string `json:"dom"`
	Clusters      string
	CacheMillis   int64
	LastRefMillis int64
	Instances     []Instance `json:"hosts"`
	Env           string
	TTL           int
}

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

## grpc通信模块设计
通信流程(7月6日更新)
1、启动nacos-coredns插件时，同时启动插件与nacos服务器的grpc通信客户端（nacos_grpc_client）。 
2、grpc通信客户端调用了Nacos-go-sdk/v2中实现的方法，从nacos服务器集群中获取一个服务器的IP地址和端口并建立TCP连接。HTTP/2下，同个域名只需要占用一个 TCP 连接，使用一个连接并行发送多个请求和响应。 
3、nacos-coredns插件向Nacos服务器请求资源时，通过grpc通信客户端来调用nacos-go-sdk/v2封装的GetAllServicesInfo、GetService等方法来获取所有服务或某个具体服务的信息详情（ip、port...）。
4、grpc通信客户端将从nacos服务器里获取到的数据转成对应nacos-coredns插件需要的数据结构，具体数据结构可根据开发中遇到的情况进行调整。
5、此外，可以对grpc通信客户端设置 超时时间 与 重试次数 等措施来避免调用超时、 阻塞等情况。


类设计图(7月10日更新)

nacos_grpc_client.go

NacosGrpcClient类的成员定义
type NacosGrpcClient struct {
	clientConfig      constant.ClientConfig 	//nacos-coredns客户端配置
	serverConfigs     []constant.ServerConfig 	//nacos服务器集群配置
	grpc_client       clients.INamingClient		//nacos-coredns与nacos服务器的grpc连接
}

客户端构造函数
NewNacosGrpcClient()
输入：clientConfig、serverConfigs 
输出：NacosGrpcClient
功能：初始化客户端

NacosGrpcClient类的方法：
	私有方法:
		func (ngc *NacosGrpcClient) reload() 
		功能： 重连nacos-coredns与nacos服务器的grpc连接

		func (ngc *NacosGrpcClient) getGrpcClient()  
		输入： 无
		输出： grpc_client 	//nacos-coredns与nacos服务器的grpc连接
		功能： 检查grpc连接是否超时，若存活则直接返回grpc连接；若超时则调用reload()后再返回grpc连接

		func (ngc *NacosGrpcClient) parseAllDomNames()					
		输入：model.ServiceList		//nacos-go-sdk中的ServiceList数据结构
		输出：AllDomNames			//nacos-coredns插件中的AllDomNames数据结构
		功能：将从Nacos服务器获取的model.ServiceList数据转换成对应Coredns的Domain数据结构

		func (ngc *NacosGrpcClient) parseDomain() 					
		输入：model.Service			//nacos-go-sdk中的Service数据结构
		输出：Domain				//nacos-coredns插件中的Domain数据结构
		功能：将从Nacos服务器获取的model.Service数据转换成对应Coredns的Instance数据结构

	公有方法：
		func (ngc *NacosGrpcClient) GetAllServicesInfo() 	
		输入：vo.GetAllServiceInfoParam //nacos-go-sdk中的GetAllServicesInfo请求参数
		输出：AllDomNames				//nacos-go-sdk中的ServiceList数据结构
		作用：对应v1版本的API(/v1/ns/api/allDomNames)，调用getGrpcClient()，调用sdk中封装的方法，获取在nacos里注册的所有服务名，调用parseAllDomNames()转换成对应的数据结构

		func (ngc *NacosGrpcClient) GetService() 					
		输入：vo.GetServiceParam    //nacos-go-sdk中的GetService请求参数
		输出：Domain				//nacos-go-sdk中的Service数据结构
		功能：对应v1版本的API(/v1/ns/api/srvIPXT)，调用getGrpcClient()，调用sdk中封装的方法，获取在nacos里注册的所有服务名，调用parseDomain()转换成对应的数据结构