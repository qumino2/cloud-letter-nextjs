import axios from 'axios';

/**
 * 调用火山方舟大模型API生成家书
 * @param parentInput - 父母输入的内容
 * @param parentRole - 父母角色（爸爸/妈妈等）
 * @param childName - 孩子的称呼
 * @returns 生成的家书内容
 */
export async function generateLetter(
  parentInput: string,
  parentRole: string,
  childName: string
): Promise<string> {
  const apiKey = process.env.VOLCANO_API_KEY;
  const apiUrl = process.env.VOLCANO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.VOLCANO_MODEL;

  if (!apiKey) {
    throw new Error('VOLCANO_API_KEY 未配置，请在 .env 文件中设置');
  }

  if (!model) {
    throw new Error('VOLCANO_MODEL 未配置，请在 .env 文件中设置');
  }

  const prompt = `你是一位专门帮助留守儿童父母表达爱意的写信助手。

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

  try {
    // 构建请求配置
    const requestConfig = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    };

    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const response = await axios.post(
      `${apiUrl}/chat/completions`,
      requestConfig,
      {
        headers: headers,
        timeout: 60000, // 60秒超时
        validateStatus: function (status) {
          return status < 500; // 不抛出4xx错误，让我们手动处理
        }
      }
    );

    // 检查HTTP状态码
    if (response.status >= 400) {
      const errorData = response.data || {};
      throw {
        response: {
          status: response.status,
          data: errorData
        },
        message: errorData.message || errorData.error || `HTTP ${response.status} 错误`
      };
    }

    // 火山方舟API返回格式可能不同，尝试多种解析方式
    let content = null;

    // 方式1: OpenAI兼容格式
    if (response.data?.choices?.[0]?.message?.content) {
      content = response.data.choices[0].message.content;
    }
    // 方式2: 嵌套data格式
    else if (response.data?.data?.choices?.[0]?.message?.content) {
      content = response.data.data.choices[0].message.content;
    }
    // 方式3: result格式
    else if (response.data?.result?.choices?.[0]?.message?.content) {
      content = response.data.result.choices[0].message.content;
    }
    // 方式4: 直接content字段
    else if (response.data?.content) {
      content = response.data.content;
    }
    // 方式5: 文本字段
    else if (response.data?.text) {
      content = response.data.text;
    }

    if (!content) {
      console.error('API响应格式异常，完整响应:', JSON.stringify(response.data, null, 2));
      throw new Error('API返回格式异常，请检查火山方舟API文档。响应数据已记录在服务器日志中');
    }

    return content.trim();
  } catch (error: any) {
    // 详细记录错误信息
    console.error('=== 火山方舟API调用失败 ===');
    console.error('错误信息:', error.message);
    console.error('状态码:', error.response?.status);
    console.error('响应数据:', JSON.stringify(error.response?.data, null, 2));
    console.error('请求URL:', `${apiUrl}/chat/completions`);
    console.error('========================');

    if (error.response?.status === 401) {
      throw new Error('API密钥无效，请检查 VOLCANO_API_KEY 配置');
    }
    if (error.response?.status === 404) {
      throw new Error('模型不存在或API端点错误，请检查 VOLCANO_MODEL 和 VOLCANO_API_URL 配置');
    }
    if (error.response?.status === 500) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || '服务器内部错误';
      throw new Error(`火山方舟API服务器错误: ${errorMsg}。请检查API配置和请求格式`);
    }

    throw new Error(`生成家书失败: ${error.response?.data?.message || error.response?.data?.error?.message || error.message}`);
  }
}
