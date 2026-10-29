# ZoteroQuicklook

[English](README.md) | [简体中文](README.zh-CN.md)

**GitHub：** [shanyueWei/ZoteroQuickLook-7-10](https://github.com/shanyueWei/Zotero-QuickLook-7-10)

## 目前仅在windows 11 平台Zotero版本10.0.6 进行测试，功能完整。 MacOs和lunix版本Zotero尚未进行完整功能测试。 ##

一个适用于 Zotero 7–10 的跨平台附件快速预览插件。选中文献或附件后按 **Space**，即可用系统预览程序打开本地附件。

- **默认快捷键：** Space，可在 Zotero 设置中修改。
- **右键菜单：** 选择条目或附件后，点击 **Quick Look**。
- **设置位置：** 编辑 → 设置 → ZoteroQuicklook（macOS：Zotero → 设置 → ZoteroQuicklook）。
- 本项目由社区维护，与 Zotero 官方及下方列出的早期 QuickLook 插件作者无隶属关系。

### 平台要求

| 平台 | 预览程序 |
| --- | --- |
| Windows | [QuickLook for Windows (QL-Win)](https://github.com/QL-Win/QuickLook)，并在后台运行 |
| macOS | 系统自带的 `/usr/bin/qlmanage` |
| Linux | `gloobus-preview` |

附件必须已下载到本地。Windows 版本通过 QL-Win 的本地命名管道发送预览请求，不会替你安装或启动 QL-Win。

### 安装

1. 在本项目目录运行构建脚本：

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\build-xpi.ps1
   ```

2. 在 Zotero 中打开 **工具 → 插件**，点击齿轮菜单并选择 **从文件安装插件…**。
3. 选择 `dist/ZoteroQuicklook-1.0.xpi`，然后按提示重启 Zotero。
4. 在 ZoteroQuicklook 设置面板中启用插件、修改快捷键，或配置自定义预览程序。

> **版本提示：** 当前插件版本按要求设为 1.0。若已安装版本号高于 1.0，请先卸载旧版本，再安装此包；Zotero 可能不会将较低版本识别为更新。

如果安装了其他 QuickLook 插件，请先禁用或卸载，避免多个插件同时响应空格键。

### 自定义预览程序

在设置面板填写程序完整路径和启动参数模板。用 `{file}` 表示附件路径，例如：

```text
--preview "{file}"
```

参数会拆分为独立的进程参数，不支持完整 shell 命令语法；自定义程序会直接启动。

### 开发与验证

本插件无 npm 或运行时依赖。提交更改前可运行：

```powershell
node --check .\bootstrap.js
node --check .\preferences.js
powershell -ExecutionPolicy Bypass -File .\scripts\build-xpi.ps1
```

GitHub Actions 会检查 JavaScript 语法、设置页 XML 并构建 XPI。推送与 `manifest.json` 版本一致的标签（例如 `v1.0`）可触发发布流程。

### 已知限制

- Windows 需要 QL-Win 已在后台运行。插件通过 Windows Script Host 隐藏启动 PowerShell，避免终端窗口闪现。
- Linux 需要安装 `gloobus-preview` 并确保命令在 `PATH` 中。
- 当前开发环境为 Windows，macOS 与 Linux 的预览调用尚未在本机验证。
- 项目使用 [MIT 许可证](LICENSE)。

### 致谢

本项目参考了以下 Zotero QuickLook 插件：

- [ZoteroQuickLook](https://github.com/mronkko/ZoteroQuickLook)
- [ZoteroQuickLookReload](https://github.com/404neko/ZoteroQuickLookReload)
- [ZoteroQuickLookMac](https://github.com/gchapron/ZoteroQuickLookMac)
- [ZoteroQuickLookNG-z7](https://github.com/canyi-chen/ZoteroQuickLookNG-z7)
