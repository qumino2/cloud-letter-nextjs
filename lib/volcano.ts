/**
 * 获取 prompt 模板
 */
function getPrompt(parentInput: string, parentRole: string, childName: string): string {
  return `你是一位专门帮助留守儿童父母表达爱意的写信助手。

背景：很多外出务工的父母想对孩子表达关心，但不善言辞，说出来的话往往变成简单的命令或唠叨。你的任务是把他们简短的话语，转化成一封温暖、真诚、有画面感的家书。

要求：
1. 保持父母原本想表达的核心意思
2. 加入情感温度，让孩子感受到被爱、被理解
3. 语言要朴实自然，不要太文绉绉，像真正的父母说话
4. 适当加入一些生活细节或回忆，让信更有真实感
5. 长度适中，200-300字左右
6. 以"${childName}"作为称呼，以"${parentRole}"的身份来写
7. 不要使用 markdown 格式，只输出纯文本的信件内容

父母想说的话：「${parentInput}」

请直接输出这封家书，不要有任何前言或解释：`;
}

/**
 * 调用火山方舟大模型API生成家书（流式输出）
 * @param parentInput - 父母输入的内容
 * @param parentRole - 父母角色（爸爸/妈妈等）
 * @param childName - 孩子的称呼
 * @returns ReadableStream - 流式响应
 */
export async function generateLetterStream(
  parentInput: string,
  parentRole: string,
  childName: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.VOLCANO_API_KEY;
  const apiUrl = process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.VOLCANO_MODEL;

  if (!apiKey) {
    throw new Error('VOLCANO_API_KEY 未配置，请在 .env 文件中设置');
  }

  if (!model) {
    throw new Error('VOLCANO_MODEL 未配置，请在 .env 文件中设置');
  }

  const prompt = getPrompt(parentInput, parentRole, childName);

  // 构建请求配置
  const requestConfig = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 500,  // 减少到 500
    temperature: 0.8,
    stream: true  // 启用流式输出
  };

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestConfig)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API 错误:', response.status, errorData);
      throw new Error(`API 请求失败: ${response.status} ${errorData.message || errorData.error || ''}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 创建一个转换流来处理 SSE 格式的数据
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const json = JSON.parse(data);

              // 尝试多种可能的响应格式
              let content = null;

              // OpenAI 兼容格式
              if (json.choices?.[0]?.delta?.content) {
                content = json.choices[0].delta.content;
              }
              // 其他可能的格式
              else if (json.data?.choices?.[0]?.delta?.content) {
                content = json.data.choices[0].delta.content;
              }
              else if (json.result?.choices?.[0]?.delta?.content) {
                content = json.result.choices[0].delta.content;
              }

              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e, data);
            }
          }
        }
      }
    });

    return response.body.pipeThrough(transformStream);
  } catch (error: any) {
    console.error('=== 火山方舟API调用失败 ===');
    console.error('错误信息:', error.message);
    console.error('========================');
    throw error;
  }
}
