---
title: 动态规划经典问题
date: 2023-02-13 16:04:43
description: 动态规划两大经典：路径问题与背包问题
categories: 
 - 学习笔记
---
# 动态规划

## [路径问题](https://mp.weixin.qq.com/s?__biz=MzU4NDE3MTEyMA==&mid=2247485580&idx=1&sn=84c99a0a8ab7b543c3678db577309b97&scene=21#wechat_redirect)

## 背包问题

背包问题是一种经典的动态规划问题，它是求解在限制条件下（如物品数量和背包容量）能获得的最大价值。下面是一种解决背包问题的常见方法：

定义状态：设 f[i][j] 表示使用前 i 个物品，容量为 j 的背包可以获得的最大价值。

状态计算：可以通过以下方程计算状态：

f[i][j] = f[i-1][j] (如果不选第 i 个物品)
f[i][j] = max(f[i-1][j], f[i-1][j-weight[i]] + value[i]) (如果选第 i 个物品)
其中，weight[i] 和 value[i] 分别表示第 i 个物品的重量和价值。

输出结果：f[n][m] 即为所求答案，其中 n 是物品数量，m 是背包容量。
这种方法的时间复杂度为 O(n * m)，空间复杂度为 O(n * m)，适用于完全背包问题和01背包问题。


- 01背包

取得目标价值的最小成本 dp[i] = min(dp[i], dp[i-val]+1)


- 完全背包 ： 兑换零钱

取得目标价值的所有组合(是否重复) dp[i] += dp[i-val]

# 二分
二分实际就是将搜索范围分成两半，根据有序的一半来确定搜索的值是否在其中！！！！

## Search
`func Search(n int, f func(int) bool) int `

- 函数作用
Search函数采用二分法搜索找到[0, n)区间内最小的满足f(i)==true的值i。实现逻辑是，Search函数希望f在输入位于区间[0, n)的前面某部分（可以为空）时返回假，而在输入位于剩余至结尾的部分（可以为空）时返回真；Search函数会返回满足f(i)==true的最小值i。如果没有该值，函数会返回n。注意，未找到时的返回值不是-1，这一点和strings.Index等函数不同。Search函数只会用区间[0, n)内的值调用f。

```
func Search(n int, f func(int) bool) int {
	i, j := 0, n
	for i < j {
        //计算二分值，等同于 (i+j) /2 
        //没有使用(i+j)/2的原因是 为了避免数值太大时，溢出
		h := int(uint(i+j) >> 1) 
		// i ≤ h < j
		if !f(h) {
            //f(h)为false时，将i从二分位向后移（查询后面是否有f(n)为true的值）
            //这里也可以看出来i后移之后i前面的值就不会在扫描了
            //如果i后面的值f(n)的结果都是false，i前面的值有f(n)为true也扫描不到的
			i = h + 1 // preserves f(i-1) == false
		} else {
            //f(h)为true时，将最大值j前移到二分位（查询前面是否还有为ture的如果没有，则这个就是最小值）
			j = h // preserves f(j) == true
		}
	}
	// i == j, f(i-1) == false, and f(j) (= f(i)) == true  =>  answer is i.
	return i
}
```

测试实例
1.二分位是true，向前查询
```
	data := []int{10, 25, 11, 24, 17, 26}
	i := sort.Search(len(data), func(i int) bool {
		return data[i] >= 23
	})
	fmt.Println("最终的结果为", i)  // 1  
```
2.二分位是false，向后查询
```
	data := []int{10, 22, 11, 22, 17, 26}
	i := sort.Search(len(data), func(i int) bool {
		return data[i] >= 23
	})
	fmt.Println("最终的结果为", i)   //最终的结果为5
```
3.二分位是false，向后查询（但是二分位前面是存在f(n)为true的）
```
	data := []int{10, 25, 11, 22, 17, 26}
	i := sort.Search(len(data), func(i int) bool {
		return data[i] >= 23
	})
	fmt.Println("最终的结果为", i)  //最终的结果为5
    //可以看到 i=1的 25是没有找到的
```
4.没有找到合适的，返回的i值为n
```
	data := []int{10, 25, 11, 22, 17, 22}
	i := sort.Search(len(data), func(i int) bool {
		return data[i] >= 23
	})
	fmt.Println("最终的结果为", i)   //6
```