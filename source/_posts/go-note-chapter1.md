---
title: Go语言圣经笔记-第一章
date: 2022-11-05 13:32:43
categories: 
 - go
---
## 1.1 GO语言中的Main package and main function in Golang

[](https://www.golearningsource.com/fundamentals/main-package-and-main-function-in-golang/#:~:text=In%20Golang%20main%20package%20is%20a%20special%20package.,is%20an%20entry%20point%20to%20a%20Go%20program.)
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