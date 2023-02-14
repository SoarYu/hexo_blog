---
title: 位运算符
date: 2023-02-13 16:04:43
categories: 
 - leetcode
---

# 剑指offer

## 动态规划

### 路径问题
https://mp.weixin.qq.com/s?__biz=MzU4NDE3MTEyMA==&mid=2247485580&idx=1&sn=84c99a0a8ab7b543c3678db577309b97&scene=21#wechat_redirect

### 背包问题
背包问题是一种经典的动态规划问题，它是求解在限制条件下（如物品数量和背包容量）能获得的最大价值。下面是一种解决背包问题的常见方法：

定义状态：设 f[i][j] 表示使用前 i 个物品，容量为 j 的背包可以获得的最大价值。

状态计算：可以通过以下方程计算状态：

f[i][j] = f[i-1][j] (如果不选第 i 个物品)
f[i][j] = max(f[i-1][j], f[i-1][j-weight[i]] + value[i]) (如果选第 i 个物品)
其中，weight[i] 和 value[i] 分别表示第 i 个物品的重量和价值。

输出结果：f[n][m] 即为所求答案，其中 n 是物品数量，m 是背包容量。
这种方法的时间复杂度为 O(n * m)，空间复杂度为 O(n * m)，适用于完全背包问题和01背包问题。