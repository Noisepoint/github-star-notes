# Privacy Policy

`GitHub Star Notes` 是一个 local-first 浏览器插件。插件的核心原则是：备注只保存在用户自己的浏览器本地。

## 我们不收集什么

插件不会收集、上传或共享：

- GitHub 账号信息。
- GitHub token。
- cookies。
- 浏览历史。
- Star 列表数据。
- 用户写下的备注。
- 用户行为数据。

## 数据保存在哪里

备注保存在当前浏览器的扩展本地存储：

```text
chrome.storage.local
```

数据只存在于：

```text
当前电脑
当前浏览器
当前插件数据区
```

插件没有后端服务器，也没有数据库。

## 网络请求

插件不会主动发起任何网络请求。

插件不会调用 GitHub API。

插件不会把备注上传到任何服务器。

## 权限

插件只申请：

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://github.com/*"]
}
```

权限含义：

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

## 导出和导入

用户可以手动导出 JSON 文件备份备注，也可以手动导入 JSON 文件恢复备注。

导出的 JSON 文件只保存在用户选择的本地位置。插件不会上传该文件。

## 卸载插件

卸载插件可能导致浏览器删除插件本地数据。请在卸载前先导出 JSON 备份。

