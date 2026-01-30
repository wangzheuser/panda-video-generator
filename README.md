# Auto Video Maker

一键文本转视频, 一键多平台自动发布

## 主要功能

### 1. 文本转视频

将文本文件自动转换为视频：

```bash
pnpm render
```

**工作流程：**
- 读取 `input/input.txt` 文本文件
- 生成语音和字幕（TTS）
- 渲染最终视频

**输出：** `out/video.mp4`

**前置要求：**
- 准备文本文件：`input/input.txt`
- Python 3（用于 TTS）

### 2. 自动发布视频到多平台

支持自动上传视频到多个平台：

**支持的平台：**
- Bilibili（哔哩哔哩）
- Douyin（抖音）

**使用方法：**

1. **登录平台**（首次使用需要）：
   ```bash
   pnpm test:login:bilibili  # Bilibili 登录
   pnpm test:login:douyin     # 抖音登录
   ```

2. **上传视频**：
   ```bash
   pnpm test:upload:bilibili  # 上传到 Bilibili
   pnpm test:upload:douyin   # 上传到抖音
   pnpm test:upload:all       # 上传到所有平台
   ```

**配置：**
- 视频文件：`out/video.mp4`
- 标题：`out/title.json` 或环境变量 `VIDEO_TITLE`
- 描述：环境变量 `VIDEO_DESC`
- 标签：环境变量 `VIDEO_TAGS`（逗号分隔）

**示例：**
```bash
VIDEO_TITLE="我的视频标题" VIDEO_DESC="视频描述" VIDEO_TAGS="标签1,标签2" pnpm test:upload:douyin
```

## 快速开始

1. **安装依赖：**
   ```bash
   npm install
   ```

2. **准备文本文件：**
   ```bash
   # 创建 input/input.txt 文件，写入你的文本内容
   echo "你的视频文本内容" > input/input.txt
   ```

3. **生成视频：**
   ```bash
   pnpm render
   ```

4. **发布视频：**
   ```bash
   # 首次使用需要登录
   pnpm test:login:douyin
   
   # 上传视频
   pnpm test:upload:douyin
   ```

## 技术栈

- **视频生成：** Remotion + Next.js
- **语音合成：** Edge TTS
- **自动化：** Playwright
