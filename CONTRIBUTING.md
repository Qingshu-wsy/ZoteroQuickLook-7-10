# Contributing

Thanks for helping improve Zotero QuickLook 10.

## Before opening an issue

- Include your Zotero version and operating system.
- For preview failures, include whether the attachment is stored locally and whether the platform's preview application is running.
- Remove personal paths, library data, and other private information from logs.

## Pull requests

- Keep changes focused and preserve support for Zotero 7–10.
- Do not add runtime dependencies without explaining why they are needed.
- Run the JavaScript syntax checks and build the XPI before submitting:

  ```powershell
  node --check .\bootstrap.js
  node --check .\preferences.js
  powershell -ExecutionPolicy Bypass -File .\scripts\build-xpi.ps1
  ```

- Describe the behavior changed and the Zotero/platform versions used to verify it.

## License

By submitting a contribution, you agree that it will be distributed under the project's [MIT License](LICENSE).
