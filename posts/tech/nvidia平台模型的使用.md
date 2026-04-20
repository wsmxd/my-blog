---
title: nvidia平台模型的使用
date: "2026-04-20"
description: "使用Nvidia平台的免费模型调用"
tags: [ai, llm]
cover: "8000.jpeg"
---
# 首先创建一个账号
然后
[申请一个apikey](https://build.nvidia.com/settings/api-keys)
# 挑选一个模型
[选择一个模型](https://build.nvidia.com/models)
>需要注意的是只有右上角标记为**Free Endpoint**的模型才能够被调用
# 最后开始使用
``` python
from openai import OpenAI

# 初始化客户端，指向 NVIDIA 的接口
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="your-api-key"
)

# 调用模型
completion = client.chat.completions.create(
    model="minimaxai/minimax-m2.7", #需要注意这里必须填写为（模型厂商/模型名字）的形式才行
    messages=[{"role": "user", "content": "晚上好，请介绍一下你自己。"}],
    temperature=0.5,
    top_p=1,
    max_tokens=1024,
    reasoning_effort="medium", #需要注意选择的模型有没有推理能力
    timeout=45,
    stream=True
)

for chunk in completion:
    if chunk.choices and len(chunk.choices) > 0:
        delta = chunk.choices[0].delta
        # 使用 .get('content') 或者判断 content is not None
        if delta.content: 
            print(delta.content, end="", flush=True)
```