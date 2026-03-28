import { GenericPageSpider } from '../generic-url-spider';

export interface ZhihuQuestion {
  title: string;
  content: string;
  answers: ZhihuAnswer[];
}

export interface ZhihuAnswer {
  author: string;
  content: string;
  voteCount: number;
}

/**
 * Zhihu (and compatible) question/article extraction via the same browser pipeline as GenericPageSpider.
 * Prefer this class when the call site is Zhihu-specific; use GenericPageSpider directly for arbitrary URLs.
 */
export class ZhihuSpider {
  private inner = new GenericPageSpider();

  async init(): Promise<void> {
    await this.inner.init();
  }

  async close(): Promise<void> {
    await this.inner.close();
  }

  /**
   * Load URL and extract title, question body (or article body), and answers when the page is a Zhihu question.
   */
  async extractQuestion(url: string): Promise<ZhihuQuestion> {
    const p = await this.inner.extractPage(url);
    return {
      title: p.title,
      content: p.content,
      answers: p.answers,
    };
  }

  async saveToFile(data: ZhihuQuestion, outputPath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Content saved to: ${outputPath}`);
  }

  async saveToMarkdown(data: ZhihuQuestion, outputPath: string): Promise<void> {
    const fs = await import('fs/promises');

    let markdown = `# ${data.title}\n\n`;

    if (data.content) {
      markdown += `## Question\n\n${data.content}\n\n`;
    }

    markdown += `## Answers\n\n`;

    data.answers.forEach((answer, index) => {
      markdown += `### Answer ${index + 1} (by ${answer.author})`;
      if (answer.voteCount > 0) {
        markdown += ` - ${answer.voteCount} votes`;
      }
      markdown += `\n\n${answer.content}\n\n---\n\n`;
    });

    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`Markdown saved to: ${outputPath}`);
  }
}

export default ZhihuSpider;
