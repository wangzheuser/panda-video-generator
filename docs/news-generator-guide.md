# 每日新闻生成器使用指南

## 快速开始

### 1. 配置 API 密钥

在项目根目录创建或编辑 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 2. 生成今日新闻

```bash
# 方法 1: 使用 pnpm 命令（推荐）
pnpm generate:news

# 方法 2: 使用直接命令
pnpm news:generate

# 方法 3: 直接运行脚本
sh scripts/generate-news.sh

# 方法 4: 使用 tsx
tsx spider/news-generator.ts
```

### 3. 生成指定日期的新闻

```bash
# 生成 2026 年 3 月 2 日的新闻
pnpm generate:news -- 2026-03-02

# 其他方法
pnpm news:generate 2026-03-02
sh scripts/generate-news.sh 2026-03-02
tsx spider/news-generator.ts 2026-03-02
```

## 工作原理

1. **日期处理**: 自动获取今天的日期，或使用你指定的日期
2. **AI 生成**: 通过 DeepSeek API 生成 10 条重要新闻
3. **内容格式化**: 每条新闻包含：
   - 简洁的标题（10-20 字）
   - 详细描述（20-50 字）
4. **脚本生成**: 将新闻整理成流畅的视频播报台词（800-1000 字）
5. **文件输出**: 生成以下文件：
   - `output/tts/input.txt` - 视频脚本
   - `output/video/title.json` - 视频标题
   - `output/tts/news-metadata.json` - 元数据

## 输出示例

### 生成的脚本格式

```
大家好，今天是2026年3月2日 星期一，为您带来今日要闻。

首先是国内新闻，中国政府宣布新一轮经济刺激政策，重点支持科技创新和绿色能源发展，预计将带动数千亿投资。

国际方面，美国与欧盟达成贸易协定，降低关税壁垒，标志着跨大西洋经济合作进入新阶段。

科技领域，人工智能领域取得重大突破，新型量子计算芯片研制成功，运算速度提升百倍。

经济数据显示，一月份消费者信心指数上升，反映出经济复苏态势持续向好。

社会新闻，教育部发布新政，推动职业教育改革，拓宽技能人才培养渠道。

文化方面，国产电影票房创新高，展现文化产业蓬勃发展活力。

环境保护方面，全国碳排放交易市场交易活跃，绿色转型步伐加快。

体育赛事，中国队在国际赛事中夺得金牌，为国争光。

健康领域，新型疫苗研发成功，为公共卫生安全提供更强保障。

最后是民生新闻，多地出台住房保障新政，改善群众居住条件。

以上就是今天的新闻，感谢收看。
```

### title.json

```json
{
  "title": "今日要闻 2026年3月2日 星期一"
}
```

### news-metadata.json

```json
{
  "date": "2026-03-02",
  "formattedDate": "2026年3月2日 星期一",
  "generatedAt": "2026-03-02T10:30:00.000Z",
  "scriptPath": "output/tts/input.txt",
  "title": "今日要闻 2026年3月2日 星期一"
}
```

## 完整视频生成流程

```bash
# 步骤 1: 生成新闻脚本
pnpm generate:news

# 步骤 2: 渲染视频
pnpm render:video

# 步骤 3: 上传到平台（可选）
pnpm test:upload:bilibili
pnpm test:upload:douyin
# 等等...
```

## 自定义配置

### 修改新闻数量

编辑 `spider/news-generator.ts` 第 93 行的提示词：

```typescript
要求：
1. 选择当天最重要、最有影响力的10条新闻  // 改为你想要的数量
```

### 调整描述长度

编辑第 96-97 行：

```typescript
   - 新闻描述（20-50字，重点突出关键信息）  // 调整字数范围
```

### 修改总字数

编辑第 107 行：

```typescript
- 总字数控制在800-1000字  // 调整总字数范围
```

### 更改播报风格

编辑第 119-121 行的 system prompt：

```typescript
{
  role: 'system',
  content: `You are a professional news anchor and content creator...`,
}
```

## 文件结构

```
spider/
├── news-generator.ts       # 主程序
├── caption-generator.ts    # 知乎内容生成器（参考）
├── spider-zhihu.ts         # 知乎爬虫（参考）
└── README.md              # 工具文档

scripts/
├── generate-news.sh       # 新闻生成器脚本
└── spider-zhihu.sh        # 知乎爬虫脚本

output/
├── tts/
│   ├── input.txt          # 生成的视频脚本
│   └── news-metadata.json # 元数据
└── video/
    └── title.json         # 视频标题
```

## 高级用法

### 作为模块导入

```typescript
import { generateDailyNews } from './spider/news-generator';

// 生成今天的新闻
await generateDailyNews();

// 生成指定日期的新闻
const targetDate = new Date('2026-03-02');
await generateDailyNews(targetDate);

// 指定输出目录
await generateDailyNews(new Date(), 'custom/output/path');
```

### 批量生成

```bash
# 生成过去一周的新闻
for i in {0..6}; do
  date=$(date -v-${i}d +%Y-%m-%d)
  echo "Generating news for $date"
  pnpm news:generate $date
  sleep 5  # 避免 API 限流
done
```

## 常见问题

### Q: DeepSeek API 密钥在哪里获取？

A: 访问 [DeepSeek 官网](https://www.deepseek.com) 注册账号并获取 API 密钥。

### Q: 为什么生成的新闻不是今天的？

A: DeepSeek 的训练数据有截止日期，无法获取实时新闻。生成的内容基于其训练数据和推理能力。

### Q: 如何提高生成内容的质量？

A: 可以：
1. 调整 `temperature` 参数（第 127 行）
2. 优化 system prompt 和 user prompt
3. 在生成后人工审核和调整

### Q: 生成的内容包含特殊符号怎么办？

A: 提示词中已要求不添加符号（第 103 行）。如果仍有问题，可以在代码中添加后处理步骤：

```typescript
// 在第 145 行后添加
scriptText = scriptText.replace(/[《》【】()]/g, '');
```

### Q: 如何支持英文新闻？

A: 修改提示词和格式化函数：

```typescript
// 第 54 行修改为
function formatDateEnglish(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
```

## 性能优化

- **API 调用**: 每次生成约消耗 1-2 秒
- **成本**: DeepSeek API 价格较低，具体参考官网定价
- **限流**: 注意 API 调用频率限制
- **缓存**: 可以缓存已生成的新闻避免重复请求

## 注意事项

1. **内容真实性**: AI 生成的新闻可能不准确，建议人工审核
2. **版权问题**: 确保生成的内容符合使用规范
3. **API 配额**: 注意 DeepSeek API 的使用配额和计费
4. **网络要求**: 需要稳定的网络连接访问 API
5. **日期格式**: 必须使用 YYYY-MM-DD 格式（如 2026-03-02）

## 故障排查

### 错误: DEEPSEEK_API_KEY is not set

**解决方法**: 在 `.env.local` 中设置 API 密钥

### 错误: Invalid date format

**原因**: 日期格式不正确

**解决方法**: 使用 YYYY-MM-DD 格式，例如 `2026-03-02`

### 错误: No text content in DeepSeek response

**可能原因**:
- API 服务暂时不可用
- API 密钥无效
- 网络连接问题

**解决方法**:
1. 检查 API 密钥是否正确
2. 检查网络连接
3. 稍后重试

## 技术支持

- 查看详细文档: `spider/README.md`
- GitHub Issues: 项目仓库的 Issues 页面
- API 文档: [DeepSeek API Documentation](https://platform.deepseek.com/docs)

## 更新日志

- **v1.0.0** (2026-03-02)
  - ✨ 初始版本
  - 支持生成今日和指定日期的新闻
  - 自动生成视频脚本和标题
  - 输出元数据文件

## 许可证

参见项目根目录的 LICENSE 文件。
