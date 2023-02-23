---
title: go笔记：数组、slice、new、make 区别
date: 2022-07-06 13:32:43
categories: 
 - 学习笔记
 - go
---

## [Go 数组与切片](https://zhuanlan.zhihu.com/p/78747815)

### new() 和 make() 的区别
看起来二者没有什么区别，都在堆上分配内存，但是它们的行为不同，适用于不同的类型。

new(T) 为每个新的类型T分配一片内存，初始化为 0 并	且返回类型为*T的内存地址：
这种方法 返回一个指向类型为 T，值为 0 的地址的指针，
它适用于值类型如数组和结构体（参见第 10 章）；它相当于 &T{}。
make(T) 返回一个类型为 T 的初始值，它只适用于3种内建的引用类型：切片、map 和 channel（参见第 8 章，第 13 章）。
换言之，new 函数分配内存，make 函数初始化

![参考链接](https://blog.csdn.net/ouyangyiwen/article/details/111548053)
## new和make的区别：

1）new是为值类型分配内存（可以任意类型的数据），其返回的是指针，指向分配类型的内存地址。         

2）make为引用类型分配内存并初始化，如：chan、map和slice，其返回值为这个类型（引用）本身。   

3）new 分配的空间被清零。make 分配空间后，会进行初始化；

### New函数
#### 一. 为切片分配内存

          如下面代码所示，用new分配一个切片内存后，此时slice是空的（&[]）,仅仅声明了一个指针指向这个空的slice的地址。如果我们直接（*s1）[0]=100会panic，报错：index out of range。
``` go
package main
import "fmt"
func test() {
	s1 := new([]int) //为slice分配内存，返回地址
	(*s1)[0] = 100
	fmt.Println(s1)
	return
}
func main() {
	test()
}
```
如果我们要用这个slice，我们还需将其初始化，代码如下。我们用make对这个slice进行初始化，再赋值（*s1）[0]=100就可成功运行，结果如后图所示。
``` go
package main
import "fmt"
func test() {
	s1 := new([]int) //为slice分配内存，返回地址
	fmt.Println(s1)
	s2 := make([]int, 10) //为slice分配内存，返回值类型
	*s1 = make([]int, 5)
	(*s1)[0] = 100
	s2[0] = 100
	fmt.Println(s1)
	return
}
func main() {
	test()
}
```
#### 二. 为变量和自定义类型分配内存空间

2.1为变量分配
``` go
package main
import "fmt"
func main() {
	var sum *int = new(int)    //new分配空间
	fmt.Println(*sum)
	*sum = 98                  
	fmt.Println(*sum)
}
```
2.2 为自定义类型分配内存，如果我们不分配内存，就会panic。
``` go
package main
import "fmt"
func main() {
	type Student struct {
		name string
		age  int
	}
	var s *Student
	s = new(Student) //分配空间
	s.name = "dequan"
	fmt.Println(s)
}
```
###  make
make 也是用于内存分配的，但是和 new 不同，它只用于 chan、map 以及 slice 的内存创建，而且它返回的类型就是这三个类型本身，而不是他们的指针类型
我们可以通过如下代码和输出结果对比观察他们区别。
``` go
package main
import "fmt"
func test() {
	s1 := new([]int) //为slice分配内存，返回地址
	fmt.Println(s1)
	s2 := make([]int, 10) //为slice分配内存，返回值类型
	fmt.Println(s2)
	*s1 = make([]int, 5)
	(*s1)[0] = 100
	s2[0] = 100
	fmt.Println(s1)
	fmt.Println(s2)
	return
}
func main() {
	test()
}
```
