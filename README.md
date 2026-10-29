# ZoteroQuicklook

[English](README.md) | [简体中文](README.zh-CN.md)

**GitHub:** [shanyueWei/ZoteroQuickLook-7-10](https://github.com/shanyueWei/Zotero-QuickLook-7-10)

## At present, testing is only conducted on Zotero version 1.0.6 on the Windows 11 platform, and the functionality is complete. The MacOS and Linux versions of Zotero have not undergone complete feature testing yet. ##

A cross-platform add-on for previewing local Zotero attachments on Zotero 7–10. Select an item or attachment and press **Space** to open it with your platform's preview application.

- **Default shortcut:** Space; configurable in Zotero Settings.
- **Context menu:** Select an item or attachment and choose **Quick Look**.
- **Settings:** Edit → Settings → ZoteroQuicklook (macOS: Zotero → Settings → ZoteroQuicklook).
- Community-maintained and independent; not affiliated with Zotero or the authors of earlier QuickLook add-ons listed below.

### Requirements

| Platform | Preview application |
| --- | --- |
| Windows | [QuickLook for Windows (QL-Win)](https://github.com/QL-Win/QuickLook), running in the background |
| macOS | The built-in `/usr/bin/qlmanage` |
| Linux | `gloobus-preview` |

Attachments must be available locally. On Windows, the add-on sends a preview request to QL-Win's local named pipe; it does not install or start QL-Win.

### Installation

1. From the project directory, build the add-on:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\build-xpi.ps1
   ```

2. In Zotero, open **Tools → Plugins**, open the gear menu, and choose **Install Plugin From File…**.
3. Select `dist/ZoteroQuicklook-1.0.xpi`, then restart Zotero if prompted.
4. Open the ZoteroQuicklook settings pane to enable the add-on, change the shortcut, or configure a custom preview program.

> **Version note:** The add-on version is set to 1.0 as requested. If you have a higher version installed, uninstall it before installing this package; Zotero may not treat a lower version as an update.

If another QuickLook add-on is installed, disable or remove it to avoid duplicate shortcut handling.

### Custom preview program

Set the executable path and argument template in the settings pane. Use `{file}` where the attachment path should be inserted, for example:

```text
--preview "{file}"
```

Arguments are split into individual process arguments; this is not a full shell command parser. The custom executable is launched directly.

### Development and validation

The add-on has no npm or runtime package dependencies. Before submitting changes, run:

```powershell
node --check .\bootstrap.js
node --check .\preferences.js
powershell -ExecutionPolicy Bypass -File .\scripts\build-xpi.ps1
```

GitHub Actions checks JavaScript syntax and preferences XML, then builds the XPI. Pushing a tag matching the version in `manifest.json` (for example, `v1.0`) triggers the release workflow.

### Known limitations

- Windows requires QL-Win to already be running. Windows Script Host launches the PowerShell helper hidden to prevent a console from flashing.
- Linux requires `gloobus-preview` to be installed and available on `PATH`.
- macOS and Linux preview behavior has not been tested in the current Windows development environment.
- This project is distributed under the [MIT License](LICENSE).

### Acknowledgements

This project was informed by prior Zotero QuickLook add-ons:

- [ZoteroQuickLook](https://github.com/mronkko/ZoteroQuickLook)
- [ZoteroQuickLookReload](https://github.com/404neko/ZoteroQuickLookReload)
- [ZoteroQuickLookMac](https://github.com/gchapron/ZoteroQuickLookMac)
- [ZoteroQuickLookNG-z7](https://github.com/canyi-chen/ZoteroQuickLookNG-z7)
