---
title: About Hexo
date: 2022-06-21 15:21:00
categories: 
 - Deploy相关
---
# 有关Hexo-fluid主题的各种配置

##  一、页脚增加网站运行时长 

**只需要在主题配置中的 footer: content 添加：**
```yaml
footer:
  content: '
    <a href="https://hexo.io" target="_blank" rel="nofollow noopener"><span>Hexo</span></a>
    <i class="iconfont icon-love"></i>
    <a href="https://github.com/fluid-dev/hexo-theme-fluid" target="_blank" rel="nofollow noopener"><span>Fluid</span></a>
    <div style="font-size: 0.85rem">
      <span id="timeDate">载入天数...</span>
      <span id="times">载入时分秒...</span>
      <script src="/js/duration.js"></script>
    </div>
  '
```
**content 前三行是 Fluid 原有的页脚内容，建议不要删除，可稍作修改，保留 Fluid 的超链接，用于向更多人推广主题。**

**duration.js 包含的才是功能代码，我们在博客目录下创建 source/js/duration.js，内容如下：**
``` javasrcipt
    !(function() {
    /** 计时起始时间，自行修改 **/
    var start = new Date("2020/01/01 00:00:00");

    function update() {
        var now = new Date();
        now.setTime(now.getTime()+250);
        days = (now - start) / 1000 / 60 / 60 / 24;
        dnum = Math.floor(days);
        hours = (now - start) / 1000 / 60 / 60 - (24 * dnum);
        hnum = Math.floor(hours);
        if(String(hnum).length === 1 ){
        hnum = "0" + hnum;
        }
        minutes = (now - start) / 1000 /60 - (24 * 60 * dnum) - (60 * hnum);
        mnum = Math.floor(minutes);
        if(String(mnum).length === 1 ){
        mnum = "0" + mnum;
        }
        seconds = (now - start) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
        snum = Math.round(seconds);
        if(String(snum).length === 1 ){
        snum = "0" + snum;
        }
        document.getElementById("timeDate").innerHTML = "本站安全运行&nbsp"+dnum+"&nbsp天";
        document.getElementById("times").innerHTML = hnum + "&nbsp小时&nbsp" + mnum + "&nbsp分&nbsp" + snum + "&nbsp秒";
    }

    update();
    setInterval(update, 1000);
    })();
```
**不要忘记把上面注释的时间改为自己的时间，至此这项功能引入了。**

## 二、博客阅读量统计

这里我使用一个第三方服务Leancloud来统计文章的阅读量。

首先需要打开 Leancloud 的官网，注册一个账号，注册好账号之后，点击左上角的按钮，创建一个应用。

创建时「应用名称」可以随你自由命名，下方的「应用计价方案」选择「开发版」就好，不需要花钱，接着点击右下角的蓝色按钮「创建」。

创建好应用之后，打开应用的「设置 >> 应用凭证」，页面中有两个参数，一个是AppID，一个是AppKey。

这两个参数下方的值等会要用到，暂时不要把网页关掉。

在主题 _config.yaml 中 leancloud 下方有两个需要配置的参数，一个是app_id，一个是app_key，这两个参数的值就分别对应上面说到的AppID和AppKey。

接着我们还要开启每篇博客的数据统计的功能，在博客主题配置文件中搜索关键字 view。

每篇博客的数据统计 views 下方有两个参数，一个是 enable，将其设置为 enable 或 true 都可以；一个是统计的来源 source，设置为 leancloud。