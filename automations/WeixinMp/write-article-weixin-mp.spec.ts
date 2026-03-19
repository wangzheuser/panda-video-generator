import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { getAuthFilePath } from '../utils/login-helper';
import { OUTPUT_DIRS } from '../../types/paths';

/**
 * Auto-fill a WeChat Official Account (微信公众号) article.
 * Reads from zhihu-to-weixin-mp-article.ts output when present (output/tts/weixin-mp-article.json).
 * Body supports rich text (HTML): <p>, <strong>, <em>, <br>, etc. 公众号 does not support Markdown.
 *
 * 1. Generate content: pnpm zhihu:weixin-mp -- <zhihu_url>
 * 2. Run test: pnpm exec playwright test automations/WeixinMp/write-article-weixin-mp.spec.ts --project=chromium --headed
 */

const weixinMpAuthPath = getAuthFilePath('weixin-mp');
test.use({
  storageState: existsSync(weixinMpAuthPath) ? weixinMpAuthPath : undefined,
});

const WX_MP_ARTICLE_JSON = path.join(process.cwd(), OUTPUT_DIRS.TTS, 'weixin-mp-article.json');

const DEFAULT_TEMPLATE = {
  title: '今日简讯',
  author: '编辑',
  body: `<p>大家好，这是一篇简单的公众号文章模板。</p>
<p>正文内容支持<strong>富文本</strong>，可使用 <em>段落</em>、加粗、斜体等。</p>
<p>以上为示例内容，可根据需要修改。</p>`,
};

function loadArticle(): { title: string; author: string; body: string } {
  if (!existsSync(WX_MP_ARTICLE_JSON)) {
    return DEFAULT_TEMPLATE;
  }
  try {
    const raw = readFileSync(WX_MP_ARTICLE_JSON, 'utf-8');
    const data = JSON.parse(raw) as { title?: string; author?: string; body?: string };
    return {
      title: typeof data.title === 'string' ? data.title : DEFAULT_TEMPLATE.title,
      author: typeof data.author === 'string' ? data.author : DEFAULT_TEMPLATE.author,
      body: typeof data.body === 'string' ? data.body : DEFAULT_TEMPLATE.body,
    };
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

test.describe.configure({ timeout: 12 * 60 * 1000 }); // AI 配图 + 发表流程可能较长

/** Wait until multiple .ai-image-item-progress-text appear, then until all are gone. */
async function waitForAiImageProgressThenGone(tab: Page): Promise<void> {
  const progressTexts = tab.locator('.ai-image-item-progress-text');
  await expect.poll(async () => progressTexts.count(), { timeout: 90_000 }).toBeGreaterThanOrEqual(2);
  await expect.poll(async () => progressTexts.count(), { timeout: 8 * 60_000 }).toBe(0);
}

test('write article (from zhihu-to-weixin-mp-article.json or default template)', async ({ page, context }) => {
  page.setDefaultTimeout(30 * 1000);

  const article = loadArticle();
  if (existsSync(WX_MP_ARTICLE_JSON)) {
    console.log(`Using article from ${WX_MP_ARTICLE_JSON}: "${article.title}" by ${article.author}`);
  } else {
    console.log('Using default template (run pnpm zhihu:weixin-mp -- <zhihu_url> to generate from Zhihu)');
  }

  await page.goto('https://mp.weixin.qq.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');

  const page2Promise = page.waitForEvent('popup');
  await page.locator('.new-creation__menu-content').first().click();
  const newTab = await page2Promise;
  await expect(newTab.getByRole('textbox', { name: '请在这里输入标题' })).toBeVisible();

  await newTab.getByRole('textbox', { name: '请在这里输入标题' }).click();
  await newTab.getByRole('textbox', { name: '请在这里输入标题' }).fill(article.title);
  await newTab.getByRole('textbox', { name: '请输入作者' }).click();
  await newTab.getByRole('textbox', { name: '请输入作者' }).fill(article.author);

  // Body: insert rich text (HTML) from zhihu-to-weixin-mp-article output
  const bodyArea = newTab.locator('div').filter({ hasText: /^从这里开始写正文$/ }).nth(5);
  await bodyArea.click();
  await newTab.waitForTimeout(300);
  await bodyArea.evaluate(
    (el, html) => {
      el.focus();
      el.innerHTML = html;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    article.body
  );

  // Declaration: 未声明 -> checkbox -> 确定 (only if visible)
  const undeclaredLink = newTab.getByText('未声明').first();
  if (await undeclaredLink.isVisible().catch(() => false)) {
    await undeclaredLink.click();
    await newTab.waitForTimeout(500);
    const checkbox = newTab.locator('.weui-desktop-icon-checkbox').first();
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.click();
      await newTab.getByRole('button', { name: '确定' }).first().click().catch(() => { });
    }
  }


  await newTab.getByText('拖拽或选择封面 默认首图为封面').click();
  await newTab.getByRole('link', { name: 'AI 配图' }).click();
  await newTab.getByRole('textbox', { name: '请描述你想要创作的内容' }).click();
  await newTab.getByRole('textbox', { name: '请描述你想要创作的内容' }).fill(article.title);
  await newTab.getByRole('button', { name: '开始创作' }).click();
  await waitForAiImageProgressThenGone(newTab);

  // await expect(newTab.getByText('已在图片库中找到以下图片').first()).toBeVisible();
  await newTab.locator('.ai-image-item-wrp').last().click();
  await newTab.waitForTimeout(1000 + Math.random() * 2000);
  await newTab.getByRole('button', { name: '使用' }).click();
  await newTab.waitForTimeout(1000 + Math.random() * 2000);
  await newTab.getByRole('button', { name: '确认' }).click();
  await newTab.waitForTimeout(1000 + Math.random() * 2000);
  await newTab.getByRole('button', { name: '发表' }).click();

  // Wait for 发表 dialog (weui-desktop-dialog with title 发表)
  const publishDialog = newTab.locator('.weui-desktop-dialog').filter({ has: newTab.getByRole('heading', { name: '发表' }) });
  await publishDialog.waitFor({ state: 'visible', timeout: 10000 });

  // 群发通知: click the first switch (label toggles the hidden checkbox)
  await publishDialog.locator('label.weui-desktop-switch').first().click();
  await newTab.waitForTimeout(500);

  // 发表 button in dialog footer
  await publishDialog.locator('.weui-desktop-dialog__ft').getByRole('button', { name: '发表' }).click();
  await newTab.waitForTimeout(1000);

  // 继续发表 if confirmation appears
  const continueBtn = newTab.getByRole('button', { name: '继续发表' });
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click();
    await newTab.waitForTimeout(1000);
  }


  await newTab.getByRole('heading', { name: '微信验证' }).click();
  await newTab.getByRole('heading', { name: '正在发表' }).click();
  await newTab.getByRole('heading', { name: '已发表，正在返回首页' }).click();

  console.log('Success: Weixin Mp Article');
});
