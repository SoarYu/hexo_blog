---
title: 笔记：Go语言圣经 
date: 2022-11-05 13:32:43
categories: 
 - 学习笔记
 - go
---
## 一、第一章

### 1.1 [main-package-and-main-function](https://www.golearningsource.com/fundamentals/main-package-and-main-function-in-golang/#:~:text=In%20Golang%20main%20package%20is%20a%20special%20package.,is%20an%20entry%20point%20to%20a%20Go%20program.)

Golang 中 main package 是一个特殊的包， 是启动Go语言程序的的包。 main package 还包含主函数。 main 函数是 Go 程序的入口点。 在 main 包中，init 函数在 main 函数被调用之前被调用。

```golang
package main
import "fmt"
func init() {
	fmt.Println("init func is first called!")
}
func main() {
	fmt.Println("main func is after init func called!")
	fmt.Println("Hello, 世界")
}
```


### 1.2 [有关golang package中init方法的多处定义及运行顺序问题](https://blog.csdn.net/zhuxinquan61/article/details/73712251)

1. 在同一个package中，可以多个文件中定义init方法

2. 在同一个package中，不同文件中的init方法的执行按照文件名先后执行各个文件中的init方法

3. 在同一个go文件中，可以重复定义init方法

4. 在同一个文件中的多个init方法，按照在代码中编写的顺序依次执行不同的init方法



### 1.3 格式化输出

fmt.Printf 函数对一些表达式产生格式化输出。该函数的首个参数是个格式字符串，指定后续参数被如何格式化。

```
fmt.Printf("%d\t%s\n", int, string)
```

各个参数的格式取决于“转换字符”（conversion character），形式为百分号后跟一个字母。

举个例子，%d 表示以十进制形式打印一个整型操作数，而 %s 则表示把字符串型操作数的值展开。

Printf 有一大堆这种转换，Go程序员称之为动词（verb）。下面的表格虽然远不是完整的规范，但展示了可用的很多特性：

```
%d          十进制整数
%x, %o, %b  十六进制，八进制，二进制整数。
%f, %g, %e  浮点数： 3.141593 3.141592653589793 3.141593e+00
%t          布尔：true或false
%c          字符（rune） (Unicode码点)
%s          字符串
%q          带双引号的字符串"abc"或带单引号的字符'c'
%v          变量的自然形式（natural format）
%T          变量的类型
%%          字面上的百分号标志（无操作数）
```

默认情况下，Printf 不会换行。按照惯例，以字母 f 结尾的格式化函数，如 log.Printf 和 fmt.Errorf，都采用 fmt.Printf 的格式化准则。
而以 ln 结尾的格式化函数，则遵循 Println 的方式，以跟 %v 差不多的方式格式化参数，并在最后添加一个换行符。（译注：后缀 f 指 format，ln 指 line。）

### 1.4 文件IO

实现上，bufio.Scanner、ioutil.ReadFile 和 ioutil.WriteFile 都使用 *os.File 的 Read 和 Write 方法。

但是，大多数程序员很少需要直接调用那些低级（lower-level）函数。高级（higher-level）函数，像 bufio 和 io/ioutil 包中所提供的那些，用起来要容易点。

```golang
f, err := os.Open(arg)
if err != nil {
	fmt.Fprintf(os.Stderr, "Dup2: %v\n", err)
	return
}
countLines(f, counts)
input := bufio.NewScanner(f)
for input.Scan() {
	line := input.Text()
	······
}
f.Close()
```

```golang
// ReadFile 函数返回一个字节切片（byte slice），必须把它转换为 string，才能用 strings.Split 分割。
data, err := ioutil.ReadFile(filename)
if err != nil {
	fmt.Fprintf(os.Stderr, "dup3: %v\n", err)
	return
}
for _, line := range strings.Split(string(data), "\n") {
	counts[line]++	
}
```

### 1.5 goroutine go channel
goroutine是一种函数的并发执行方式，而channel是用来在goroutine之间进行参数传递。
main函数本身也运行在一个goroutine中，而go function则表示创建一个新的goroutine，并在这个新的goroutine中执行这个函数。

main函数中用make函数创建了一个传递string类型参数的channel，对每一个命令行参数，我们都用go这个关键字来创建一个goroutine，并且让函数在这个goroutine异步执行http.Get方法。
这个程序里的io.Copy会把响应的Body内容拷贝到ioutil.Discard输出流中（译注：可以把这个变量看作一个垃圾桶，可以向里面写一些不需要的数据），因为我们需要这个方法返回的字节数，但是又不想要其内容。
每当请求返回内容时，fetch函数都会往ch这个channel里写入一个字符串，由main函数里的第二个for循环来处理并打印channel里的这个字符串。

**当一个goroutine尝试在一个channel上做send或者receive操作时，这个goroutine会阻塞在调用处，直到另一个goroutine从这个channel里接收或者写入值，这样两个goroutine才会继续执行channel操作之后的逻辑。**

在这个例子中，每一个fetch函数在执行时都会往channel里发送一个值（ch <- expression），主函数负责接收这些值（<-ch）。
这个程序中我们用main函数来完整地处理/接收所有fetch函数传回的字符串，可以避免因为有两个goroutine同时完成而使得其输出交错在一起的危险。

### 总结

- **命名类型：** 类型声明使得我们可以很方便地给一个特殊类型一个名字。因为struct类型声明通常非常地长，所以我们总要给这种struct取一个名字。
```golang
type Point struct {
    X, Y int
}
var p Point
```

- **指针：** Go语言提供了指针。指针是一种直接存储了变量的内存地址的数据类型。在其它语言中，比如C语言，指针操作是完全不受约束的。在另外一些语言中，指针一般被处理为“引用”，除了到处传递这些指针之外，并不能对这些指针做太多事情。Go语言在这两种范围中取了一种平衡。指针是可见的内存地址，&操作符可以返回一个变量的内存地址，并且*操作符可以获取指针指向的变量内容，但是在Go语言里没有指针运算，也就是不能像c语言里可以对指针进行加或减操作。我们会在2.3.2中进行详细介绍。

- **方法和接口：** 方法是和命名类型关联的一类函数。Go语言里比较特殊的是方法可以被关联到任意一种命名类型。在第六章我们会详细地讲方法。接口是一种抽象类型，这种类型可以让我们以同样的方式来处理不同的固有类型，不用关心它们的具体实现，而只需要关注它们提供的方法。第七章中会详细说明这些内容。

- **包（packages）：** Go语言提供了一些很好用的package，并且这些package是可以扩展的。Go语言社区已经创造并且分享了很多很多。所以Go语言编程大多数情况下就是用已有的package来写我们自己的代码。通过这本书，我们会讲解一些重要的标准库内的package，但是还是有很多限于篇幅没有去说明，因为我们没法在这样的厚度的书里去做一部代码大全。





