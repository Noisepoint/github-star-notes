# GitHub Star Notes SPEC

版本：v0.1  
日期：2026-06-23  
状态：第一期开发规格

## 1. 项目定位

`GitHub Star Notes` 是一个 local-first 浏览器插件，为 GitHub Stars 列表页和 repo 详情页添加本地私人备注。

一句话定位：

> 给 GitHub Stars 和 repo 页面加一条私人备注，帮助用户不点进项目也能知道这个 repo 是干什么的。

第一期目标不是做完整收藏管理器，而是解决一个明确痛点：

> GitHub Star 过的项目太多，项目名又常常是英文、缩写或品牌名，过一段时间只看列表很难想起它的用途。

## 2. 目标用户

主要用户：

- 收藏了很多 GitHub 项目的人。
- 经常忘记某个英文 repo 是做什么的人。
- 希望用中文备注管理 starred repositories 的用户。
- 想要轻量、本地、无需账号的 GitHub 收藏辅助工具的用户。

## 3. 产品原则

第一期必须遵守：

- 极简。
- local-first。
- 不登录。
- 不联网。
- 不使用 GitHub API。
- 不读取 GitHub token。
- 不上传备注。
- 不追踪用户行为。
- 不做云同步。
- 不改变 GitHub 原有 Star 行为。
- 视觉上尽量像 GitHub 原生功能，轻量、克制、精致。

## 4. 第一期开源可用版范围

第一期目标：做成可开源、可本地加载安装的 Chrome / Edge 插件。

必须实现：

1. Chrome / Edge 本地加载插件。
2. GitHub Stars 列表页显示备注。
3. GitHub Stars 列表页编辑备注。
4. GitHub repo 详情页显示备注。
5. GitHub repo 详情页编辑备注。
6. 同一个 repo 在 Stars 列表页和 repo 详情页共享同一条备注。
7. 备注保存到浏览器本地。
8. JSON 导出备注。
9. JSON 导入备注。
10. GitHub 页面动态刷新适配。
11. README 安装说明。
12. privacy.md 隐私说明。
13. 基础 icon。
14. 支持 GitHub light / dark mode。

第一期不做：

- 云同步。
- 用户账号。
- GitHub OAuth。
- GitHub API。
- 标签编辑。
- 独立管理页。
- AI 自动总结。
- 浏览器商店上架。
- Firefox 适配。
- GitHub Lists 页面。
- GitHub 搜索结果页。
- 用户 repositories 列表页。

## 5. 支持页面

第一期必须支持：

```text
https://github.com/{username}?tab=stars
https://github.com/{owner}/{repo}
```

说明：

- `https://github.com/{username}?tab=stars` 是用户 Star 过的 repo 列表页。
- `https://github.com/{owner}/{repo}` 是具体 repo 详情页。

第一期暂不承诺支持：

```text
https://github.com/stars/{list}
https://github.com/{username}?tab=repositories
GitHub 搜索结果页
```

说明：

- `https://github.com/stars/{list}` 是 GitHub 官方 Stars Lists 页面。
- `https://github.com/{username}?tab=repositories` 是某个用户自己创建的 repositories 列表页，不是 Star 列表页。
- GitHub 搜索结果页是用户搜索 repo 后看到的结果页。

这些页面可以作为后续增强范围。

## 6. 核心交互

### 6.1 Stars 列表页

在每个 repo 条目下方插入轻量备注区域。

无备注时：

```text
添加备注
```

有备注时：

```text
我的备注：前端网页幻灯片生成器，适合参考 AI PPT 工具    编辑
```

点击 `添加备注` 或 `编辑` 后，原地展开编辑状态：

```text
[ textarea ]
128 / 500
[ 保存 ] [ 取消 ] [ 删除 ]
```

交互规则：

- 点击保存后写入本地存储。
- 点击取消后恢复原显示状态。
- 空备注保存等同于删除备注。
- 删除备注只清空该 repo 的 note，不删除其他 repo 数据。
- 展示状态默认最多显示 2 行，超出部分省略。
- 编辑状态显示完整内容。

### 6.2 repo 详情页

在 repo 标题区域或 About 区域附近插入备注模块。

建议模块文案：

```text
GitHub Star Note
前端网页幻灯片生成器，适合参考 AI PPT 工具
编辑
```

无备注时：

```text
GitHub Star Note
添加备注
```

交互规则：

- 与 Stars 列表页使用同一条数据。
- 在 repo 详情页编辑后，回到 Stars 列表页必须能看到更新后的备注。
- 在 Stars 列表页编辑后，进入 repo 详情页必须能看到更新后的备注。

## 7. 视觉与交互风格

视觉目标：

```text
轻量、克制、精致，像 GitHub 原生功能，不破坏页面。
```

设计要求：

- 适配 GitHub light mode 和 dark mode。
- 不使用花哨颜色。
- 不使用大面积装饰。
- 不遮挡 GitHub 原有信息。
- 不改变 repo 原有布局结构。
- hover 时显示编辑 / 删除等次要操作。
- 保存成功给轻微反馈。
- textarea 自动聚焦。
- 字数计数显示为 `当前字数 / 500`。
- 备注模块边距、字号、边框风格要贴近 GitHub 原生 UI。

Stars 列表页建议更轻：

```text
📝 前端网页幻灯片生成器，适合参考 AI PPT 工具    编辑
```

repo 详情页可以稍完整：

```text
GitHub Star Note
前端网页幻灯片生成器，适合参考 AI PPT 工具
编辑
```

注意：如果实现时发现 emoji 与 GitHub 原生风格不协调，可以去掉 emoji。

## 8. 备注长度

第一期限制：

```text
最多 500 个字符
```

规则：

- 中文、英文、符号都按 JavaScript 字符串长度计数。
- 超过 500 字符时禁止保存，并提示用户。
- 展示状态默认最多显示 2 行。
- 编辑状态显示完整备注。

选择 500 字符的原因：

- 足够记录项目用途、适用场景和个人判断。
- 不至于破坏 GitHub Stars 列表视觉。
- 后续如果需要更长备注，可以再扩展。

## 9. 数据结构

插件内部数据使用版本化结构，方便后续迁移。

```json
{
  "version": 1,
  "repos": {
    "owner/repo": {
      "note": "这个项目是做什么的",
      "tags": [],
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    }
  }
}
```

第一期实际使用：

```text
note
createdAt
updatedAt
```

第一期预留但不展示：

```text
tags
```

## 10. repo key 规则

统一使用：

```text
owner/repo
```

例子：

```text
zarazhangrui/frontend-slides
lewisululu/html-ppt-skill
```

要求：

- Stars 列表页必须解析出 `owner/repo`。
- repo 详情页必须解析出相同的 `owner/repo`。
- 同一 repo 在不同页面必须共用同一条备注。
- repo key 保持原始英文大小写，不主动改写。

## 11. 存储方案

第一期使用：

```text
chrome.storage.local
```

说明：

- `chrome.storage.local` 是 Chrome 浏览器扩展自带的本地存储能力。
- 数据保存在当前电脑、当前浏览器、当前插件的数据区。
- 不需要数据库。
- 不需要后端。
- 不上传服务器。
- 不需要 GitHub 授权。

不使用：

```text
localStorage
IndexedDB
远程服务器
数据库
```

本地存储含义：

```text
这台电脑的 Chrome 写的备注，只在这台电脑的 Chrome 里有。
换电脑或换浏览器后默认没有，需要通过 JSON 导出 / 导入迁移。
```

## 12. JSON 导出 / 导入

### 12.1 导出

导出功能用于备份和迁移备注。

规则：

- 导出完整数据结构，包括 `version` 和 `repos`。
- 默认文件名：

```text
github-star-notes-backup.json
```

使用场景：

- 换电脑。
- 换浏览器。
- 备份数据。
- 重装浏览器前保存备注。

### 12.2 导入

导入功能用于恢复或迁移备注。

规则：

- 用户选择 JSON 文件。
- 插件校验 JSON 格式。
- 导入时执行合并。
- 新 repo：添加。
- 已有 repo：用导入文件里的数据覆盖本地数据。
- 无效 repo 数据：跳过并提示。
- 导入完成后刷新当前页面备注显示。

合并含义：

```text
导入文件里的备注会加到当前插件已有备注里，而不是先把当前所有备注清空。
如果同一个 repo 同时存在于本地和导入文件，则以导入文件为准。
```

示例：

本地已有：

```json
{
  "repos": {
    "a/repo-one": {
      "note": "本机备注"
    }
  }
}
```

导入文件：

```json
{
  "repos": {
    "b/repo-two": {
      "note": "旧电脑备注"
    }
  }
}
```

导入后：

```json
{
  "repos": {
    "a/repo-one": {
      "note": "本机备注"
    },
    "b/repo-two": {
      "note": "旧电脑备注"
    }
  }
}
```

## 13. GitHub 动态刷新适配

GitHub Stars 页面可能发生局部刷新，例如：

- 搜索 stars。
- 语言筛选。
- 排序。
- 翻页。
- 浏览器前进 / 后退。
- GitHub 局部替换列表内容。

如果插件只在首次页面加载时运行，后续新出现的 repo 可能没有备注模块。

第一期要求：

- 使用 `MutationObserver` 监听页面内容变化。
- 页面变化后重新扫描 repo 列表。
- 为新出现的 repo 插入备注模块。
- 插入前必须检查是否已经插入，避免重复渲染。
- 对重复触发做 debounce，避免频繁渲染。

## 14. 权限说明

`manifest.json` 第一版只申请：

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://github.com/*"]
}
```

权限含义：

- `storage`：允许插件在浏览器本地保存备注。
- `https://github.com/*`：允许插件在 GitHub 页面上插入备注 UI。

这些是浏览器插件向用户浏览器申请的权限，不是 GitHub 账号权限。

不申请：

```text
tabs
cookies
history
identity
activeTab
webRequest
```

第一期不需要 GitHub OAuth，不需要 GitHub token。

## 15. 项目结构

建议结构：

```text
github-star-notes/
├── manifest.json
├── src/
│   ├── content.js
│   ├── storage.js
│   ├── github-page.js
│   ├── ui.js
│   └── import-export.js
├── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── privacy.md
└── SPEC.md
```

职责：

- `content.js`：插件入口，判断页面类型，协调渲染。
- `storage.js`：读写本地备注。
- `github-page.js`：解析 repo key，识别 Stars 列表页和 repo 详情页。
- `ui.js`：创建备注模块和编辑状态。
- `import-export.js`：导入 / 导出 JSON。
- `styles.css`：插件样式。

## 16. README 必须包含

README 至少包含：

1. 项目一句话介绍。
2. 功能截图或 GIF 占位。
3. 本地加载安装步骤。
4. 使用方法。
5. 数据和隐私说明。
6. 导出 / 导入说明。
7. 第一版支持范围。
8. 后续计划。

本地加载安装步骤：

```text
1. 下载本仓库 ZIP 并解压。
2. 打开 chrome://extensions/ 或 edge://extensions/。
3. 开启 Developer mode。
4. 点击 Load unpacked。
5. 选择本项目文件夹。
6. 打开 GitHub Stars 页面使用。
```

## 17. privacy.md 必须说明

privacy.md 至少说明：

- 插件不收集个人信息。
- 插件不上传备注。
- 插件不追踪用户行为。
- 插件不读取 GitHub token。
- 插件不使用 GitHub API。
- 备注只保存在浏览器本地 `chrome.storage.local`。
- 用户可以通过导出 JSON 备份数据。
- 卸载插件可能导致本地备注被删除。

## 18. 验收标准

第一期完成时必须满足：

1. Chrome 本地加载插件成功。
2. Edge 本地加载插件成功。
3. 打开 Stars 页面，每个 repo 能显示备注入口。
4. 在 Stars 页面添加备注后，刷新页面备注仍存在。
5. 在 Stars 页面编辑备注后，刷新页面显示更新内容。
6. 打开 repo 详情页，能看到同一条备注。
7. 在 repo 详情页修改备注后，Stars 页面同步显示。
8. 空备注保存等同删除。
9. 超过 500 字符时不能保存。
10. 导出 JSON 成功。
11. 清空插件数据后，导入 JSON 能恢复备注。
12. 导入时同名 repo 以导入文件为准。
13. GitHub Stars 搜索 / 排序 / 翻页后备注模块不丢失。
14. 备注模块不会重复插入。
15. 插件不发起任何网络请求。
16. README 能指导普通用户完成本地安装。
17. privacy.md 明确说明本地存储和不上传数据。
18. light mode 和 dark mode 下视觉都可用。

## 19. 后续增强

上架后再考虑：

- 标签。
- 备注搜索。
- GitHub Lists 页面支持。
- GitHub 搜索结果页支持。
- 用户 repositories 列表页支持。
- Firefox 适配。
- Chrome Web Store 上架。
- Edge Add-ons 上架。
- `chrome.storage.sync`。
- 独立管理页。
- GitHub API 拉取 starred repos。
- AI 自动总结 repo 用途。

## 20. 后续增强解释

### 20.1 标签

标签用于分类备注，例如：

```text
slides
frontend
agent
AI
docs
```

用途：

- 按主题筛选。
- 按用途整理。
- 后续独立管理页中做分类浏览。

第一期只在数据结构里预留 `tags: []`，不展示、不编辑。

### 20.2 repo 详情页备注

第一期已包含。

含义：

```text
用户打开 https://github.com/{owner}/{repo} 时，也能看到和编辑同一条私人备注。
```

### 20.3 GitHub Lists 页面

GitHub 官方 Stars Lists 可以把 starred repos 分组。

后续如果支持，用户打开某个 List 页面时，也能看到备注。

第一期不做，因为核心痛点在 Stars 总列表和 repo 详情页。

### 20.4 独立管理页

独立管理页是插件自己的页面，用于统一查看、搜索、筛选和批量编辑所有备注。

这会让产品更像完整收藏管理器，但第一期不做。

### 20.5 GitHub API 拉取 starred repos

后续如果要做独立管理页，可能需要通过 GitHub API 拉取用户 Star 过的所有 repo。

这会引入：

- GitHub token 或 OAuth。
- API 限制。
- 更复杂的隐私说明。
- 更高审核成本。

第一期不做。

## 21. 开发注意事项

- 不要为了第一期引入构建工具，除非确有必要。
- 优先使用原生 JavaScript、CSS 和 Chrome Extension API。
- 不要依赖远程 CDN。
- 不要加载远程脚本。
- 不要引入会触发额外隐私疑虑的第三方 SDK。
- 所有功能应离线可用。
- DOM 选择器应尽量稳健，避免强依赖 GitHub 临时 class。
- 对 GitHub 页面结构变化要有容错。
- 如果无法识别 repo key，不应报错阻塞页面，只跳过该条目。

## 22. 第一期开发表述

对外描述建议：

> GitHub Star Notes 是一个本地优先的浏览器插件，可以在 GitHub Stars 列表和 repo 页面给仓库添加私人备注。备注只保存在你的浏览器本地，不上传服务器，也不需要 GitHub 授权。

短描述：

> 给 GitHub Stars 添加本地私人备注。

