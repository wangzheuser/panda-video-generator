#!/usr/bin/env node

/**
 * CLI: Zhihu URL → output/spider/output.json (+ DeepSeek script at getTtsInputFile(), title.json, public sync).
 * Usage: tsx packages/spider/zhihu/cli-zhihu-video-prep.ts <zhihu_url>
 */

import { ZhihuSpider } from './zhihu-question-spider';
import { generateVideoScript } from '@panda-video-generator/caption-generator';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { getTtsInputFile } from '@panda-video-generator/caption-generator/paths';
import {
  getSpiderOutputDir,
  getSpiderOutputJsonPath,
  getSpiderTitleJsonPath,
  PUBLIC_VIDEO_DIR,
  PUBLIC_TITLE_JSON_FOR_REMOTION,
} from '../paths';

async function main() {
  const url = process.argv[2];

  // Validate URL
  if (!url) {
    console.error('❌ Error: Please provide a Zhihu question URL');
    console.error('Usage: tsx packages/spider/zhihu/cli-zhihu-video-prep.ts <zhihu_url>');
    console.error('Example: tsx packages/spider/zhihu/cli-zhihu-video-prep.ts https://www.zhihu.com/question/316150890');
    process.exit(1);
  }

  // Validate Zhihu URL format
  if (!url.match(/^https:\/\/www\.zhihu\.com\/question\//)) {
    console.error('❌ Error: Invalid Zhihu URL format');
    console.error('Expected format: https://www.zhihu.com/question/<question_id>');
    process.exit(1);
  }

  const spider = new ZhihuSpider();

  try {
    console.log('🕷️  Initializing browser...');
    await spider.init();

    console.log(`📝 Extracting content from: ${url}`);
    const data = await spider.extractQuestion(url);

    console.log('\n=== Extracted Content ===');
    console.log(`Title: ${data.title}`);
    console.log(`Question: ${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}`);
    console.log(`Answers found: ${data.answers.length}`);

    // Save crawl JSON (fixed name: output.json)
    const spiderOutDir = getSpiderOutputDir();
    await fs.mkdir(resolve(process.cwd(), spiderOutDir), { recursive: true });
    const outputPath = resolve(process.cwd(), getSpiderOutputJsonPath());
    const onDisk = {
      title: data.title,
      content: data.content,
      answers: data.answers,
    };
    await fs.writeFile(outputPath, JSON.stringify(onDisk, null, 2), 'utf-8');
    console.log(`Content saved to: ${outputPath}`);

    console.log('\n✅ Extraction completed successfully!');

    // Generate video script
    if (data.title && (data.content || data.answers.length > 0)) {
      try {
        await generateVideoScript(data);
      } catch (error) {
        console.error('⚠️  Failed to generate video script, but extraction was successful');
        console.error(error);
      }
    }

    // Generate title.json under spider output dir
    if (data.title) {
      const titleJsonPath = resolve(process.cwd(), getSpiderTitleJsonPath());
      const publicTitleJsonPath = resolve(process.cwd(), PUBLIC_TITLE_JSON_FOR_REMOTION);
      try {
        await fs.mkdir(resolve(process.cwd(), getSpiderOutputDir()), { recursive: true });
        await fs.writeFile(
          titleJsonPath,
          JSON.stringify({ title: data.title }, null, 2),
          'utf-8'
        );
        console.log(`\n📄 Title JSON exported: ${titleJsonPath}`);
        console.log(`   Title: ${data.title}`);
        
        // Also copy to public/video/ for Remotion Studio access
        await fs.mkdir(resolve(process.cwd(), PUBLIC_VIDEO_DIR), { recursive: true });
        await fs.copyFile(titleJsonPath, publicTitleJsonPath);
        console.log(`📋 Title JSON also copied to: ${publicTitleJsonPath}`);
      } catch (error) {
        console.error('⚠️  Failed to generate title.json:', error);
      }
    }

    console.log('\n📁 Output files:');
    console.log(`  - Caption: ${getTtsInputFile()}`);
    console.log(`  - Crawl JSON: ${getSpiderOutputJsonPath()}`);
    if (data.title) {
      console.log(`  - Title JSON: ${getSpiderTitleJsonPath()}`);
    }
    console.log('\n💡 Next step: Run \'pnpm render:video\' to generate video from the extracted content');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await spider.close();
  }
}

main();
