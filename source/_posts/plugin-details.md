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



