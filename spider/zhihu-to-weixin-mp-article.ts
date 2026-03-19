#!/usr/bin/env node

/**
 * Zhihu URL -> WeChat Official Account (公众号) article generator
 * 1. Fetches Zhihu question/answers from URL
 * 2. Uses DeepSeek to generate 公众号-style article
 * 3. Outputs rich text (HTML only, no Markdown)
 *
 * Usage: tsx spider/zhihu-to-weixin-mp-article.ts <zhihu_url>
 * Example: tsx spider/zhihu-to-weixin-mp-article.ts https://www.zhihu.com/question/316150890
 */

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { promises as fs } from 'fs';
import { ZhihuSpider } from './spider';
import { OUTPUT_DIRS } from '../types/paths';

const WX_MP_ARTICLE_HTML = `${OUTPUT_DIRS.TTS}/weixin-mp-article.html`;
const WX_MP_ARTICLE_JSON = `${OUTPUT_DIRS.TTS}/weixin-mp-article.json`;

interface ZhihuQuestion {
  title: string;
  content: string;
  answers: Array<{ author: string; content: string; voteCount: number }>;
}

function loadApiKey(): void {
  const envPath = resolve(process.cwd(), '.env.local');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      if (line.startsWith('DEEPSEEK_API_KEY=')) {
        process.env.DEEPSEEK_API_KEY = line.split('=')[1].trim();
        break;
      }
    }
  } catch {
    // use system env
  }
}

/**
 * Generate 公众号 article body as rich text (HTML) from Zhihu data using DeepSeek
 */
async function generateWeixinMpArticleHtml(data: ZhihuQuestion): Promise<{ title: string; author: string; body: string }> {
  loadApiKey();
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not set. Set it in .env.local or environment.');
  }

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const contentForModel = JSON.stringify(
    { title: data.title, question: data.content, answers: data.answers },
    null,
    2
  );

  const userPrompt = `你是一个微信公众号编辑。根据下面提供的知乎问题与回答内容，写一篇适合在微信公众号发布的文章。

要求：
1. 标题：请根据文章内容重新拟定一个适合公众号的标题，不要直接使用知乎原问题标题。标题需简洁有力、吸引点击，可适度提炼或改写原意。
2. 文章风格：通俗易懂、有观点、适合公众号读者阅读。
3. 输出格式：必须是富文本 HTML，微信公众号不支持 Markdown。
4. 只使用以下 HTML 标签：<p> 段落、<strong> 加粗、<em> 斜体、<br> 换行。不要使用 <h1>~<h6>、<ul>、<ol>、<a> 等。
5. 只输出文章正文的 HTML 片段，不要包含 <html>、<body>、<head> 等外层标签。
6. 第一段可以是简短引入，中间段落提炼知乎内容要点，最后一段可以总结或金句收尾。
7. 在第一段之前加一段粗体的摘要，摘要内容为文章核心要点, 必须缩短到20个字以内.
8. 正文总字数控制在 600～1200 字，段落适中。

请按以下 JSON 格式回复（不要包含其他说明或 markdown 代码块）：
{"title":"文章标题","author":"作者名","body":"<p>第一段...</p><p>第二段...</p>"}

知乎内容（JSON）：
${contentForModel}`;

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content:
          'You are a WeChat Official Account editor. You must reply with a single JSON object only: {"title":"...","author":"...","body":"<p>...</p>"}. No extra text or markdown.',
      },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response from DeepSeek');

  // Parse JSON (strip possible markdown code fence)
  let jsonStr = raw;
  const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  const parsed = JSON.parse(jsonStr) as { title?: string; author?: string; body?: string };
  const title = typeof parsed.title === 'string' ? parsed.title : '公众号文章';
  const author = '熊猫智研社';
  const body = typeof parsed.body === 'string' ? parsed.body : `<p>${raw}</p>`;
  return { title, author, body };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: tsx spider/zhihu-to-weixin-mp-article.ts <zhihu_url>');
    console.error('Example: tsx spider/zhihu-to-weixin-mp-article.ts https://www.zhihu.com/question/316150890');
    process.exit(1);
  }
  if (!url.match(/^https:\/\/www\.zhihu\.com\/question\//)) {
    console.error('Invalid Zhihu URL. Expected: https://www.zhihu.com/question/<id>');
    process.exit(1);
  }

  const spider = new ZhihuSpider();
  try {
    console.log('Fetching Zhihu page...');
    await spider.init();
    const data = await spider.extractQuestion(url);
    await spider.close();

    console.log(`Title: ${data.title}`);
    console.log(`Answers: ${data.answers.length}`);
    if (!data.title && !data.content && data.answers.length === 0) {
      console.error('No content extracted.');
      process.exit(1);
    }

    console.log('Generating 公众号 article (rich text) with DeepSeek...');
    const { title, author, body } = await generateWeixinMpArticleHtml(data);

    await fs.mkdir(resolve(process.cwd(), OUTPUT_DIRS.TTS), { recursive: true });
    const htmlPath = resolve(process.cwd(), WX_MP_ARTICLE_HTML);
    const jsonPath = resolve(process.cwd(), WX_MP_ARTICLE_JSON);

    await fs.writeFile(htmlPath, body, 'utf-8');
    await fs.writeFile(
      jsonPath,
      JSON.stringify({ title, author, body }, null, 2),
      'utf-8'
    );

    console.log('\nDone.');
    console.log(`  HTML: ${htmlPath}`);
    console.log(`  JSON (title/author/body): ${jsonPath}`);
    console.log(`  Title: ${title} | Author: ${author}`);
  } catch (err) {
    console.error('Error:', err);
    await spider.close().catch(() => { });
    process.exit(1);
  }
}

main();
