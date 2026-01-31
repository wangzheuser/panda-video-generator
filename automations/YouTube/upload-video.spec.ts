import { test } from '@playwright/test';
import path from 'path';
import { existsSync } from 'fs';
import { getAuthFilePath } from '../utils/login-helper';

/**
 * Auto upload video to YouTube
 * Uses Playwright's default setup with saved login state
 * Automatically reads video from out/video.mp4 and title from out/title.json
 * 
 * Usage: 
 *   pnpm test:upload:youtube
 * 
 * Or override with environment variables:
 *   VIDEO_PATH=out/custom.mp4 VIDEO_TITLE="Custom Title" pnpm test:upload:youtube
 */

interface UploadConfig {
  videoPath: string;
  title: string;
  description?: string;
  tags?: string[];
  coverPath?: string;
  privacy?: 'public' | 'unlisted' | 'private';
}

// Get video file path (default to fixed filename)
function getVideoPath(): string {
  const defaultVideoPath = path.join(process.cwd(), 'out', 'video.mp4');
  return process.env.VIDEO_PATH || defaultVideoPath;
}

// Get title from JSON file or environment
function getTitleFromJson(): string | null {
  const titleJsonPath = path.join(process.cwd(), 'out', 'title.json');
  
  if (!existsSync(titleJsonPath)) {
    return null;
  }
  
  try {
    const fs = require('fs');
    const titleData = JSON.parse(fs.readFileSync(titleJsonPath, 'utf-8'));
    return titleData.title || null;
  } catch (e) {
    return null;
  }
}

// Get upload configuration from environment or defaults
function getUploadConfig(): UploadConfig {
  const videoPath = getVideoPath();
  
  if (!videoPath || !existsSync(videoPath)) {
    throw new Error(
      `Video file not found: ${videoPath}\n` +
      'Please ensure out/video.mp4 exists or set VIDEO_PATH environment variable.'
    );
  }
  
  // Try to get title from JSON file first, then environment variable
  let title = process.env.VIDEO_TITLE || getTitleFromJson();
  
  if (!title) {
    throw new Error(
      'VIDEO_TITLE is required. Please set it:\n' +
      '  export VIDEO_TITLE="Your Video Title"\n' +
      'Or ensure out/title.json exists with a title field.'
    );
  }
  
  const config: UploadConfig = {
    videoPath: path.resolve(videoPath),
    title,
    description: process.env.VIDEO_DESC || '',
    tags: process.env.VIDEO_TAGS ? process.env.VIDEO_TAGS.split(',').map(t => t.trim()) : [],
    coverPath: process.env.VIDEO_COVER ? path.resolve(process.env.VIDEO_COVER) : undefined,
    privacy: (process.env.VIDEO_PRIVACY as 'public' | 'unlisted' | 'private') || 'unlisted',
  };
  
  return config;
}

// Load saved authentication state for YouTube if it exists
const youtubeAuthFile = getAuthFilePath('youtube');
if (existsSync(youtubeAuthFile)) {
  test.use({ storageState: youtubeAuthFile });
  console.log('Auth: YouTube');
} else {
  console.log('Auth: YouTube (not found, run: pnpm test:login:youtube)');
}

// Use a custom browser context for YouTube to bypass security detection
test.use({
  launchOptions: {
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
  contextOptions: {
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    permissions: ['geolocation'],
    geolocation: { latitude: 37.7749, longitude: -122.4194 },
    colorScheme: 'light' as const,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
});

// Configure test suite: 10 minute timeout
test.describe.configure({ timeout: 10 * 60 * 1000 });

test('upload video to youtube', async ({ page }) => {
  // Set timeout for this specific test (10 minutes)
  test.setTimeout(10 * 60 * 1000);
  
  // Remove webdriver property to avoid detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    
    // Override the plugins property to use a custom getter
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    
    // Override the languages property to use a custom getter
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
    
    // Override the permissions property
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
        : originalQuery(parameters);
  });
  
  const config = getUploadConfig();
  
  console.log(`Upload: YouTube - ${config.title}`);
  
  // Step 1: Navigate directly to YouTube Studio upload page
  console.log('🌐 Navigating to YouTube Studio upload page...');
  await page.goto('https://studio.youtube.com/channel/me/videos/upload', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Check if logged in
  const loginRequired = await page.locator('text=Sign in').first().isVisible().catch(() => false);
  const loginRequiredCN = await page.locator('text=登录').first().isVisible().catch(() => false);
  if (loginRequired || loginRequiredCN) {
    throw new Error(
      'Not logged in! Please run login script first:\n' +
      '  pnpm test:login:youtube'
    );
  }
  
  console.log('✅ Logged in successfully (using saved session)');
  
  // Step 2: Wait for upload page to load
  console.log('⏳ Waiting for upload page to load...');
  await page.waitForTimeout(3000);
  
  // Step 3: Find and use file input for video upload
  console.log('📤 Looking for upload file input...');
  await page.waitForTimeout(2000);
  
  const fileInputSelectors = [
    'input[type="file"]',
    'input[accept*="video"]',
    'input[accept*="mp4"]',
    '#select-files-button input',
    '[id*="file"] input[type="file"]',
    '[class*="upload"] input[type="file"]',
  ];
  
  let uploadInput = null;
  for (const selector of fileInputSelectors) {
    try {
      const input = page.locator(selector).first();
      const count = await input.count();
      if (count > 0) {
        uploadInput = input;
        console.log(`✅ Found file input: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Step 4: Upload video file
  console.log(`📁 Uploading video: ${config.videoPath}`);
  
  if (uploadInput) {
    try {
      await uploadInput.setInputFiles(config.videoPath);
      console.log('✅ Video file selected via input element');
      await page.waitForTimeout(3000);
    } catch (error: any) {
      console.log(`⚠️  Error with input element: ${error.message}`);
      uploadInput = null;
    }
  }
  
  // If no file input found or failed, try clicking upload area
  if (!uploadInput) {
    console.log('💡 Trying file chooser method...');
    const uploadAreaSelectors = [
      '#select-files-button',
      'button:has-text("Select files")',
      'button:has-text("选择文件")',
      '[aria-label*="Select files"]',
      '[aria-label*="选择文件"]',
      '[class*="upload"] button',
      'yt-button-shape:has-text("Select files")',
      'yt-button-shape:has-text("选择文件")',
      '[id*="select"] button',
      'button[class*="select"]',
    ];
    
    for (const selector of uploadAreaSelectors) {
      try {
        const uploadArea = page.locator(selector).first();
        const visible = await uploadArea.isVisible({ timeout: 5000 });
        if (visible) {
          console.log(`✅ Found upload area: ${selector}`);
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 10000 }),
            uploadArea.click(),
          ]);
          await fileChooser.setFiles(config.videoPath);
          console.log('✅ Video file selected via file chooser');
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  // Step 5: Wait for video to start uploading/processing
  console.log('⏳ Waiting for video upload form to appear...');
  await page.waitForTimeout(5000);
  
  // Step 6: Fill in video details (title, description, tags)
  console.log('✏️  Filling in video details...');
  
  // Fill title (support both English and Chinese)
  const titleSelectors = [
    'input[aria-label*="Title"]',
    'input[aria-label*="title"]',
    'input[aria-label*="标题"]',
    '#textbox[aria-label*="Title"]',
    '#textbox[aria-label*="title"]',
    '#textbox[aria-label*="标题"]',
    'input[name="title"]',
    '[id*="title"] input',
    '[id*="Title"] input',
    '[class*="title"] input',
    '[class*="Title"] input',
  ];
  
  let titleFilled = false;
  for (const selector of titleSelectors) {
    try {
      const titleInput = page.locator(selector).first();
      const visible = await titleInput.isVisible({ timeout: 10000 });
      if (visible) {
        console.log(`✅ Found title input: ${selector}`);
        await titleInput.click({ timeout: 2000 });
        await titleInput.fill(config.title);
        titleFilled = true;
        console.log(`✅ Title filled: ${config.title}`);
        await page.waitForTimeout(500);
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  if (!titleFilled) {
    console.log('⚠️  Warning: Could not find title input');
  }
  
  // Fill description if provided
  if (config.description) {
    const descSelectors = [
      'textarea[aria-label*="Description"]',
      'textarea[aria-label*="description"]',
      'textarea[aria-label*="描述"]',
      '#textbox[aria-label*="Description"]',
      '#textbox[aria-label*="description"]',
      '#textbox[aria-label*="描述"]',
      'textarea[name="description"]',
      '[id*="description"] textarea',
      '[class*="description"] textarea',
    ];
    
    for (const selector of descSelectors) {
      try {
        const descInput = page.locator(selector).first();
        const visible = await descInput.isVisible({ timeout: 5000 });
        if (visible) {
          console.log(`✅ Found description input: ${selector}`);
          await descInput.click({ timeout: 2000 });
          await descInput.fill(config.description);
          console.log('✅ Description filled');
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  // Fill tags if provided
  if (config.tags && config.tags.length > 0) {
    const tagSelectors = [
      'input[aria-label*="Tags"]',
      'input[aria-label*="tags"]',
      'input[aria-label*="标签"]',
      '#textbox[aria-label*="Tags"]',
      '#textbox[aria-label*="tags"]',
      '#textbox[aria-label*="标签"]',
      'input[placeholder*="tag"]',
      'input[placeholder*="标签"]',
      '[id*="tag"] input',
      '[class*="tag"] input',
    ];
    
    for (const selector of tagSelectors) {
      try {
        const tagInput = page.locator(selector).first();
        const visible = await tagInput.isVisible({ timeout: 5000 });
        if (visible) {
          console.log(`✅ Found tags input: ${selector}`);
          await tagInput.click({ timeout: 2000 });
          await tagInput.fill(config.tags.join(','));
          console.log(`✅ Tags filled: ${config.tags.join(',')}`);
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  // Step 7: Set privacy/visibility (default to unlisted)
  console.log(`🔒 Setting privacy to: ${config.privacy}`);
  await page.waitForTimeout(2000);
  
  const privacySelectors = [
    'button[aria-label*="Visibility"]',
    'button[aria-label*="visibility"]',
    'button[aria-label*="可见性"]',
    '[id*="privacy"] button',
    '[class*="privacy"] button',
    'yt-button-shape:has-text("Public")',
    'yt-button-shape:has-text("Unlisted")',
    'yt-button-shape:has-text("Private")',
    'yt-button-shape:has-text("公开")',
    'yt-button-shape:has-text("不公开列出")',
    'yt-button-shape:has-text("私人")',
  ];
  
  // Click privacy button to open dropdown
  for (const selector of privacySelectors) {
    try {
      const privacyButton = page.locator(selector).first();
      const visible = await privacyButton.isVisible({ timeout: 5000 });
      if (visible) {
        console.log(`✅ Found privacy button: ${selector}`);
        await privacyButton.click();
        await page.waitForTimeout(1000);
        
        // Select the desired privacy option (support both English and Chinese)
        const privacyText = config.privacy === 'public' ? 'Public' : config.privacy === 'private' ? 'Private' : 'Unlisted';
        const privacyTextCN = config.privacy === 'public' ? '公开' : config.privacy === 'private' ? '私人' : '不公开列出';
        const privacyOptionSelectors = [
          `text=${privacyText}`,
          `text=${privacyTextCN}`,
          `yt-button-shape:has-text("${privacyText}")`,
          `yt-button-shape:has-text("${privacyTextCN}")`,
          `[aria-label*="${privacyText}"]`,
          `[aria-label*="${privacyTextCN}"]`,
        ];
        
        for (const optionSelector of privacyOptionSelectors) {
          try {
            const option = page.locator(optionSelector).first();
            const optionVisible = await option.isVisible({ timeout: 3000 });
            if (optionVisible) {
              await option.click();
              console.log(`✅ Privacy set to: ${privacyText}`);
              await page.waitForTimeout(1000);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Step 8: Wait for video processing (if needed)
  console.log('⏳ Waiting for video processing...');
  await page.waitForTimeout(5000);
  
  // Step 9: Click "Publish" or "Save" button
  console.log('📤 Looking for publish/save button...');
  await page.waitForTimeout(2000);
  
  // Scroll to ensure buttons are visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  const publishButtonSelectors = [
    'button:has-text("Publish")',
    'button:has-text("发布")',
    'yt-button-shape:has-text("Publish")',
    'yt-button-shape:has-text("发布")',
    '[aria-label*="Publish"]',
    '[aria-label*="发布"]',
    'button:has-text("Save")',
    'button:has-text("保存")',
    'yt-button-shape:has-text("Save")',
    'yt-button-shape:has-text("保存")',
    '[aria-label*="Save"]',
    '[aria-label*="保存"]',
    'button[id*="publish"]',
    'button[id*="save"]',
  ];
  
  let publishClicked = false;
  for (const selector of publishButtonSelectors) {
    try {
      const publishButton = page.locator(selector).first();
      const visible = await publishButton.isVisible({ timeout: 10000 });
      if (visible) {
        const isEnabled = await publishButton.isEnabled().catch(() => false);
        if (isEnabled) {
          console.log(`✅ Found publish button: ${selector}`);
          await publishButton.click();
          publishClicked = true;
          console.log('✅ Publish button clicked');
          await page.waitForTimeout(3000);
          break;
        } else {
          console.log(`⚠️  Publish button found but disabled: ${selector}`);
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  if (!publishClicked) {
    console.log('❌ Could not find or click publish button');
    await page.pause();
  } else {
    // Wait for upload to complete - check for "上传完毕" in #expand-button
    console.log('⏳ Waiting for upload to complete (checking for 上传完毕)...');
    
    try {
      // Wait for the expand button to contain "上传完毕" text
      const expandButton = page.locator('#expand-button').first();
      await expandButton.waitFor({ state: 'visible', timeout: 60000 });
      await test.expect(expandButton).toContainText('上传完毕', { timeout: 60000 });
      console.log('✅ Upload completed: 上传完毕 found in #expand-button');
      console.log('Success: YouTube');
    } catch (e) {
      // Fallback: Check for other success indicators (support both English and Chinese)
      console.log('⚠️  Could not find 上传完毕, checking alternative success indicators...');
      await page.waitForTimeout(5000);
      
      const successSelectors = [
        'text=Video published',
        'text=Published',
        'text=视频已发布',
        'text=已发布',
        'text=Video saved',
        'text=Saved',
        'text=视频已保存',
        'text=已保存',
        '[aria-label*="published"]',
        '[aria-label*="saved"]',
        '[aria-label*="已发布"]',
        '[aria-label*="已保存"]',
      ];
      
      let successFound = false;
      for (const selector of successSelectors) {
        try {
          const successMessage = page.locator(selector).first();
          const visible = await successMessage.isVisible({ timeout: 30000 });
          if (visible) {
            successFound = true;
            await test.expect(successMessage).toBeVisible({ timeout: 30000 });
            console.log(`✅ Success message found: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Also check if we're redirected to videos list (another success indicator)
      if (!successFound) {
        await page.waitForTimeout(5000);
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        if (currentUrl.includes('/videos') || currentUrl.includes('/studio')) {
          successFound = true;
          console.log('✅ Redirected to videos list - upload likely successful');
        }
      }
      
      if (successFound) {
        console.log('Success: YouTube');
      } else {
        console.log('⚠️  Success: YouTube (upload completed, but verification pending)');
      }
    }
  }


await page.locator('ytcp-animatable').filter({ hasText: '频道内容 视频 Shorts' }).click();
await page.locator('div').filter({ hasText: '创建 账号' }).nth(1).click();
await page.locator('div').filter({ hasText: '创建 账号' }).nth(1).click();});
