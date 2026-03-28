import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { GenericPageSpider, type CrawledPagePayload } from './generic-url-spider';

/** Contract: spider output is only these two fields. */
export type SpiderJsonOutput = {
  title: string;
  content: string;
};

export function isZhihuQuestionUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith('zhihu.com') && u.pathname.includes('/question/');
  } catch {
    return false;
  }
}

/**
 * Merge question body + answers into a single content string for JSON export.
 */
export function flattenCrawledToSpiderJson(payload: {
  title: string;
  content: string;
  answers: CrawledPagePayload['answers'];
}): SpiderJsonOutput {
  const { title, content, answers } = payload;
  if (!answers.length) {
    return { title, content };
  }
  const blocks = answers.map((a, i) => {
    const vote = a.voteCount ? `（${a.voteCount} 赞同）` : '';
    return `【回答 ${i + 1}】${a.author}${vote}\n${a.content}`;
  });
  const merged = [content, ...blocks].filter((s) => s && String(s).trim()).join('\n\n');
  return { title, content: merged };
}

/**
 * Read a local Markdown file: first `# ` line is title, remainder is content.
 */
export function parseMarkdownToSpiderJson(filePath: string): SpiderJsonOutput {
  const absPath = resolve(filePath);
  if (!absPath.toLowerCase().endsWith('.md')) {
    throw new Error('Local input must be a .md file');
  }
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }
  const raw = readFileSync(absPath, 'utf-8');
  const lines = raw.split('\n');
  let title = '';
  const bodyLines: string[] = [];
  let foundTitle = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!foundTitle && trimmed.startsWith('# ')) {
      title = trimmed.replace(/^#+\s*/, '').trim();
      foundTitle = true;
    } else {
      bodyLines.push(line);
    }
  }
  const content = bodyLines.join('\n').trim();
  const finalTitle = title || absPath.split('/').pop()?.replace(/\.md$/i, '') || 'untitled';
  const finalContent = content || raw.trim();
  if (!finalContent || finalContent.length < 1) {
    throw new Error('Markdown file has no usable body content');
  }
  return { title: finalTitle, content: finalContent };
}

/**
 * Fetch a Zhihu question page and return { title, content } only.
 */
export async function extractZhihuUrlToSpiderJson(url: string): Promise<SpiderJsonOutput> {
  if (!isZhihuQuestionUrl(url)) {
    throw new Error(
      'URL must be a Zhihu question page (e.g. https://www.zhihu.com/question/<id>).',
    );
  }
  const spider = new GenericPageSpider();
  try {
    await spider.init();
    const p = await spider.extractPage(url);
    if (!p.content && !p.answers.length) {
      throw new Error('Could not extract content from Zhihu page.');
    }
    return flattenCrawledToSpiderJson({
      title: p.title,
      content: p.content,
      answers: p.answers,
    });
  } finally {
    await spider.close();
  }
}
