---
title: 批量图片转 WebP
tags:
  - shell
  - 图片处理
  - 优化
date: 2026-04-16
---

把当前目录下的 `.png` 批量转换成 `.webp`（需要安装 `cwebp`）。

```bash
for f in *.png; do
  [ -f "$f" ] || continue
  cwebp -q 82 "$f" -o "${f%.png}.webp"
done
```

如果想递归处理子目录，可以配合 `find` 使用。
