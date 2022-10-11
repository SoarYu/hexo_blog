---
title: 项目测试文档
date: 2022-09-15 19:47:43
categories: 
 - ospp
---

## 测试环境

- 操作系统： Linux Ubuntu20.0.4
- Golang版本： 1.17
- Nacos版本：  2.1.0
- CoreDNS版本：1.9.3

**Nacos-Coredns-Plugin
插件编译脚本**
``` shell
# cd GOPATH
cd $GOPATH/src/

# remove codes
rm -rf coredns
rm -rf nacos-coredns-plugin

# clone current codes
git clone https://github.com/nacos-group/nacos-coredns-plugin.git
git clone https://github.com/coredns/coredns.git


# cd coredns directory
cd $GOPATH/src/coredns
git checkout -b v1.9.3 v1.9.3

# copy nacos plugin to coredns
cp -r ../nacos-coredns-plugin/nacos plugin/
cp -r ../nacos-coredns-plugin/forward/setup.go plugin/forward
cp -r ../nacos-coredns-plugin/conf conf

# insert nacos into plugin
sed -i '/hosts/a\\t"nacos",' core/dnsserver/zdirectives.go
sed -i '/coredns\/plugin\/hosts/a\\t_ "github.com/coredns/coredns/plugin/nacos"' core/plugin/zplugin.go
sed -i '/hosts:hosts/a\nacos:nacos' plugin.cfg

go mod tidy

# build
make
```

## 测试用例

在原来的v1.6.7分支上，修改 个测试用例，新增 个测试用例

### nacos_client_test.go

**测试用例一：**TestNacosClient_getAllServiceNames
- 预期结果：获取Nacos服务端里注册的所有服务名并存入AllDoms
- 实际结果：成功获取Nacos服务端里注册的所有服务名并存入AllDoms
```
func TestNacosClient_getAllServiceNames(t *testing.T) {
	GrpcClient = grpcClientTest
	nacosClientTest.getAllServiceNames()

	AllDoms.DLock.Lock()
	defer AllDoms.DLock.Unlock()
	doms := GrpcClient.GetAllServicesInfo()

	for _, dom := range doms {
		assert.True(t, AllDoms.Data[dom])
	}
	if len(doms) == len(AllDoms.Data) {
		t.Log("Get all serviceName from servers passed")
	} else {
		t.Error("Get all serviceName from servers error")
	}
}
```
<div align="center">
    <img src="/img/coredns-test-report/test1.png"></img>
</div>

**测试用例二：**TestNacosClient_getDomNow
- 预期结果：获取Nacos服务端里某个服务的具体信息并存入缓存中
- 实际结果：成功获取Nacos服务端里某个服务的具体信息并存入缓存中
```
func TestNacosClient_getServiceNow(t *testing.T) {
	GrpcClient = grpcClientTest
	nacosClientTest.getAllServiceNames()
	testServiceMap := NewConcurrentMap()

	for serviceName, _ := range AllDoms.Data {
		nacosClientTest.getServiceNow(serviceName, &nacosClientTest.serviceMap, "0.0.0.0")
	}

	for serviceName, _ := range AllDoms.Data {
		testService := GrpcClient.GetService(serviceName)
		testServiceMap.Set(serviceName, testService)
		s, ok := nacosClientTest.GetDomainCache().Get(serviceName)
		assert.True(t, ok)
		service := s.(model.Service)
		assert.True(t, len(service.Hosts) == len(testService.Hosts))
	}

	if len(nacosClientTest.GetDomainCache()) == len(testServiceMap) {
		t.Log("Get all servicesInfo from servers passed")
	} else {
		t.Error("Get all servicesInfo from servers error")
	}
}
```
<div align="center">
    <img src="/img/coredns-test-report/test2.png"></img>
</div>

### nacos_grpc_client_test.go

**测试用例三：**TestGetAllServicesInfo
- 预期结果：gRPC请求获取Nacos服务端里注册的所有服务名
- 实际结果：成功通过gRPC请求获取Nacos服务端里注册的所有服务名
```
func TestGetAllServicesInfo(t *testing.T) {
	services := grpcClientTest.GetAllServicesInfo()
	if len(services) > 0 {
		t.Log("GrpcClient get all servicesInfo passed")
	} else {
		t.Log("GrpcClient get all servicesInfo empty")
	}
}
```
<div align="center">
    <img src="/img/coredns-test-report/test3.png"></img>
</div>


**测试用例四：**TestGetService
- 预期结果：gRPC请求获取Nacos服务端某个服务的具体信息
- 实际结果：成功通过gRPC请求获取Nacos服务端某个服务的具体信息
```
func TestGetService(t *testing.T) {
	services := grpcClientTest.GetAllServicesInfo()
	serviceMap := NewConcurrentMap()
	for _, serviceName := range services {
		service := grpcClientTest.GetService(serviceName)
		if assert.NotNil(t, service) {
			serviceMap.Set(serviceName, service)
		}
	}
	if serviceMap.Count() == len(services) {
		t.Log("GrpcClient get service passed")
	} else {
		t.Error("GrpcClient get service error")
	}
}
```
<div align="center">
    <img src="/img/coredns-test-report/test4.png"></img>
</div>


**测试用例五：**TestSubscribe
- 预期结果：gRPC订阅Nacos服务端某个服务
- 实际结果：成功通过gRPC订阅Nacos服务端某个服务
```
func TestSubscribe(t *testing.T) {
	doms := grpcClientTest.GetAllServicesInfo()
	for _, dom := range doms {
		err := grpcClientTest.Subscribe(dom)
		if err != nil {
			t.Error("GrpcClient subscribe service error")
			return
		}
	}
	t.Log("GrpcClient subscribe service passed")
}
```
<div align="center">
    <img src="/img/coredns-test-report/test5.png"></img>
</div>

**测试用例六：**TestCallback
- 预期结果：当Nacos服务端服务发生改变时，通过回调函数更新客户端的服务数据
- 实际结果：当Nacos服务端服务发生改变时，成功通过回调函数更新客户端的服务数据
```
func TestCallback(t *testing.T) {
    services := model.Service{
            ......
        }
    
    grpcClientTest.nacosClient.GetDomainCache().Set("demo.go", services)

    newServices := model.Service{
            ······
        }

    grpcClientTest.Callback(newServices.Hosts, nil)

	s, _ := grpcClientTest.nacosClient.GetDomainCache().Get("demo.go")

	updateServices := s.(model.Service)

	if len(newServices.Hosts) == len(updateServices.Hosts) {
		t.Log("GrpcClient Service SubscribeCallback passed")
	} else {
		t.Error("GrpcClient Service SubscribeCallback error")
	}
}
```
<div align="center">
    <img src="/img/coredns-test-report/test6.png"></img>
</div>

### setup_test.go

**测试用例七：**TestNacosParse
- 预期结果：通过配置文件配置Nacos服务器的 NamespaceId 和 ip地址和端口 .
- 实际结果：成功配置Nacos服务器的 NamespaceId 和 ip地址和端口 .
```
setup_test.go: 24 - 63 行
func TestNacosParse(t *testing.T) {
    ·······
}
```
<div align="center">
    <img src="/img/coredns-test-report/test7.png"></img>
</div>

### 所有测试用例运行结果
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
2022/09/15 16:05:03 [INFO] logDir:<C:\Users\Yu\logs>   cacheDir:<C:\Users\Yu\nacos-go-client-cache>
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


## 压力测试

1.6.7版本：

### 50000
[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.200666 sec
  RTT min:              0.000063 sec
  RTT average:          0.012621 sec
  RTT std deviation:    0.010875 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Sat Sep 17 09:49:54 2022
  Finished at:          Sat Sep 17 09:50:35 2022
  Ran for:              41.475793 seconds

  Queries per second:   1205.522460 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.093154 sec
  RTT min:              0.000066 sec
  RTT average:          0.010944 sec
  RTT std deviation:    0.005928 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Sat Sep 17 09:50:58 2022
  Finished at:          Sat Sep 17 09:51:31 2022
  Ran for:              33.176316 seconds

  Queries per second:   1507.099221 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.127623 sec
  RTT min:              0.000097 sec
  RTT average:          0.013324 sec
  RTT std deviation:    0.008517 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Sat Sep 17 09:51:56 2022
  Finished at:          Sat Sep 17 09:52:33 2022
  Ran for:              36.864735 seconds

  Queries per second:   1356.309763 qps

### 500000
Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         500000 queries
  Queries completed:    499767 queries
  Queries lost:         233 queries
  Queries delayed(?):   0 queries

  RTT max:              1578.041083 sec
  RTT min:              0.000016 sec
  RTT average:          0.036432 sec
  RTT std deviation:    0.027122 sec
  RTT out of range:     18 queries

  Percentage completed:  99.95%
  Percentage lost:        0.05%

  Started at:           Fri Sep 16 17:46:10 2022
  Finished at:          Fri Sep 16 18:17:38 2022
  Ran for:              1887.486418 seconds

  Queries per second:   264.779124 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         500000 queries
  Queries completed:    499857 queries
  Queries lost:         143 queries
  Queries delayed(?):   0 queries

  RTT max:              1158.509071 sec
  RTT min:              0.000013 sec
  RTT average:          0.036213 sec
  RTT std deviation:    0.028113 sec
  RTT out of range:     24 queries

  Percentage completed:  99.97%
  Percentage lost:        0.03%

  Started at:           Fri Sep 16 18:19:12 2022
  Finished at:          Fri Sep 16 18:43:54 2022
  Ran for:              1482.300741 seconds

  Queries per second:   337.216994 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         500000 queries
  Queries completed:    499692 queries
  Queries lost:         308 queries
  Queries delayed(?):   0 queries

  RTT max:              1594.459308 sec
  RTT min:              0.000014 sec
  RTT average:          0.039982 sec
  RTT std deviation:    0.034464 sec
  RTT out of range:     23 queries

  Percentage completed:  99.94%
  Percentage lost:        0.06%

  Started at:           Fri Sep 16 19:03:18 2022
  Finished at:          Fri Sep 16 19:35:33 2022
  Ran for:              1935.047773 seconds

  Queries per second:   258.232384 qps


### 5000000

新版本：

50000
[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.052808 sec
  RTT min:              0.000063 sec
  RTT average:          0.009972 sec
  RTT std deviation:    0.003560 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Fri Sep 16 22:07:58 2022
  Finished at:          Fri Sep 16 22:08:35 2022
  Ran for:              37.832932 seconds

  Queries per second:   1321.599923 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         50000 queries
  Queries completed:    50000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.066514 sec
  RTT min:              0.000061 sec
  RTT average:          0.007880 sec
  RTT std deviation:    0.004037 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Fri Sep 16 22:08:52 2022
  Finished at:          Fri Sep 16 22:09:26 2022
  Ran for:              34.318542 seconds

  Queries per second:   1456.938351 qps

### 500000

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         500000 queries
  Queries completed:    500000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.062532 sec
  RTT min:              0.000032 sec
  RTT average:          0.005649 sec
  RTT std deviation:    0.002476 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Sat Sep 17 00:00:22 2022
  Finished at:          Sat Sep 17 00:05:07 2022
  Ran for:              284.796569 seconds

  Queries per second:   1755.639128 qps

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         500000 queries
  Queries completed:    500000 queries
  Queries lost:         0 queries
  Queries delayed(?):   0 queries

  RTT max:              0.098301 sec
  RTT min:              0.000062 sec
  RTT average:          0.011365 sec
  RTT std deviation:    0.003072 sec
  RTT out of range:     0 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Sat Sep 17 09:03:59 2022
  Finished at:          Sat Sep 17 09:08:55 2022
  Ran for:              296.729115 seconds

  Queries per second:   1685.038558 qps

### 5000000

[Status] Testing complete

Statistics:

  Parse input file:     once
  Ended due to:         reaching end of file

  Queries sent:         5000000 queries
  Queries completed:    4999780 queries
  Queries lost:         220 queries
  Queries delayed(?):   0 queries

  RTT max:              3074.590919 sec
  RTT min:              0.000022 sec
  RTT average:          0.011621 sec
  RTT std deviation:    0.004951 sec
  RTT out of range:     20 queries

  Percentage completed: 100.00%
  Percentage lost:        0.00%

  Started at:           Fri Sep 16 22:10:31 2022
  Finished at:          Fri Sep 16 23:06:25 2022
  Ran for:              3353.644673 seconds

  Queries per second:   1490.849654 qps