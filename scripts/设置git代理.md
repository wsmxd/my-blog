---
title: 设置git代理
tags:
  - shell
  - 代理
date: 2026-04-16
---

```bash
git config --global http.proxy http://127.0.0.1:你的代理端口 #一般是7890
git config --global https.proxy https://127.0.0.1:你的代理端口
```
当使用了代理的软件，在浏览器中我们是能够正常访问到外网的，但是在使用git命令时却发现还是连接不稳定或者git命令缓慢，是因为还需要指定让git也走代理才行。