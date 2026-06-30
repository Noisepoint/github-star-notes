# GitHub Star Notes

在 GitHub 仓库页添加本地私人备注，并在 Stars 列表页自动展示。

## 这个工具解决什么问题

看到有用的 GitHub repo 时，你可能会顺手 Star，但过一段时间后又忘了当初为什么收藏它。

`GitHub Star Notes` 让你可以在 repo 页面记录项目用途、亮点或收藏原因，并在 Stars 列表页自动展示同一条备注，方便之后快速识别每个项目。

## 功能

- 在 repo 详情页添加 / 编辑备注。
- 在 GitHub Stars 列表页展示 / 编辑同一条备注。
- 备注保存在浏览器本地。
- 支持导出 JSON 备份。
- 支持导入 JSON 迁移。
- 支持 GitHub light / dark mode。

## 本地安装

当前版本已在 Chrome 本地加载测试。

1. 下载本仓库 ZIP 并解压。
2. 打开扩展管理页：

```text
chrome://extensions/
```

3. 开启 `Developer mode` / `开发者模式`。
4. 点击 `Load unpacked` / `加载已解压的扩展程序`。
5. 选择本项目文件夹。
6. 打开 GitHub Stars 页面使用。

## 支持页面

当前支持：

```text
https://github.com/{username}?tab=stars
https://github.com/{owner}/{repo}
```

暂不支持：

```text
https://github.com/stars/{list}
https://github.com/{username}?tab=repositories
GitHub 搜索结果页
```

## 使用方式

### repo 详情页

打开具体 repo 页面后，会显示备注入口：

```text
添加备注
```

例如：

```text
https://github.com/owner/repo
```

适合记录项目用途、亮点或收藏原因。

### Stars 列表页

打开你的 Stars 页面后，每个 repo 下方会显示同一条备注入口。

写过备注后会显示：

```text
我的备注：这个项目是做什么的
```

在 Stars 列表页和 repo 详情页编辑的是同一条备注。

## 备注长度

每条备注最多 500 个字符。

## 导出 / 导入

插件会在支持页面插入 `导出全部备注` 和 `导入全部备注` 按钮。

导出会生成：

```text
github-star-notes-backup.json
```

导入时会合并数据：

- 新 repo：添加。
- 已有 repo：使用导入文件中的备注覆盖本机备注。

常见使用场景：

- 换电脑。
- 换浏览器。
- 重装浏览器前备份。
- 手动备份备注。

## 数据保存在哪里

备注保存在当前浏览器的扩展本地存储：

```text
chrome.storage.local
```

这意味着：

- 备注只在当前电脑、当前浏览器、当前插件里可见。
- 换电脑默认没有备注。
- 换浏览器默认没有备注。
- 可以通过 JSON 导出 / 导入迁移。
- 卸载插件可能导致备注被删除。

## 权限说明

插件只申请：

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://github.com/*"]
}
```

含义：

- `storage`：保存本地备注。
- `https://github.com/*`：在 GitHub 页面插入备注 UI。

插件不申请：

```text
tabs
cookies
history
identity
activeTab
webRequest
```

## 开发

这个项目第一期不使用构建工具。

项目结构：

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
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── privacy.md
└── LICENSE
```

## 路线图

后续可能支持：

- 标签。
- 备注搜索。
- GitHub Lists 页面。
- GitHub 搜索结果页。
- Firefox。
- Chrome Web Store 上架。
- Edge Add-ons 上架。
- 独立管理页。
