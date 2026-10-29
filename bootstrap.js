/* global Zotero, IOUtils, PathUtils */

const ADDON_NAME = "ZoteroQuicklook";
const ADDON_ID = "zoteroquicklook10@zoteroquicklook.org";
const MENU_ID = "zotero-quicklook10-context";
const TOOLS_MENU_ID = "zotero-quicklook10-tools";
const PREFS = {
  enabled: "extensions.zoteroquicklook10.enabled",
  shortcut: "extensions.zoteroquicklook10.shortcut",
  customCommand: "extensions.zoteroquicklook10.customCommand",
  customArguments: "extensions.zoteroquicklook10.customArguments"
};
const attachedWindows = new Set();

function install() {
  log("Installed");
}

function uninstall() {
  log("Uninstalled");
}

function log(message, level = 4) {
  Zotero.debug(`${ADDON_NAME}: ${message}`, level);
}

function getPref(name, fallback) {
  const value = Zotero.Prefs.get(PREFS[name], true);
  return value == null ? fallback : value;
}

function reportError(win, error) {
  const message = error instanceof Error ? error.message : String(error);
  log(message, 1);
  (win || Zotero.getMainWindow())?.alert(`${ADDON_NAME}\n\n${message}`);
}

function isEditableTarget(target) {
  if (!target) {
    return false;
  }

  const tagName = (target.localName || target.tagName || "").toLowerCase();
  return ["input", "textarea", "select", "button", "textbox"].includes(tagName)
    || target.isContentEditable;
}

function addMenuItem(doc, parent, id, label, win) {
  if (!parent || doc.getElementById(id)) {
    return;
  }

  const item = doc.createXULElement
    ? doc.createXULElement("menuitem")
    : doc.createElement("menuitem");
  item.id = id;
  item.setAttribute("label", label);
  item.addEventListener("command", () => {
    previewSelection().catch(error => reportError(win, error));
  });
  parent.appendChild(item);
}

function addMenus(win) {
  const doc = win.document;
  const contextMenu = doc.getElementById("zotero-itemmenu");
  const toolsMenu = doc.getElementById("menu_ToolsPopup");

  addMenuItem(doc, contextMenu, MENU_ID, "Quick Look", win);
  addMenuItem(doc, toolsMenu, TOOLS_MENU_ID, "Quick Look (Space)", win);
}

function onKeyDown(event) {
  if (
    event.repeat
    || isEditableTarget(event.target)
    || !getPref("enabled", true)
    || !matchesShortcut(event, getPref("shortcut", "Space"))
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  previewSelection().catch(error => reportError(event.view, error));
}

function matchesShortcut(event, shortcut) {
  const parts = String(shortcut || "").split("+").map(part => part.trim().toLowerCase());
  const key = parts.pop();
  if (!key) {
    return false;
  }

  const modifiers = new Set(parts);
  const wantsCtrl = modifiers.has("ctrl") || modifiers.has("control");
  const wantsAlt = modifiers.has("alt") || modifiers.has("option");
  const wantsShift = modifiers.has("shift");
  const wantsMeta = modifiers.has("meta") || modifiers.has("cmd") || modifiers.has("command");
  const pressedKey = key === "space" ? " " : key;

  return event.ctrlKey === wantsCtrl
    && event.altKey === wantsAlt
    && event.shiftKey === wantsShift
    && event.metaKey === wantsMeta
    && event.key.toLowerCase() === pressedKey;
}

function attachWindow(win) {
  if (!win || attachedWindows.has(win)) {
    return;
  }

  attachedWindows.add(win);
  win.addEventListener("keydown", onKeyDown, true);
  addMenus(win);
}

function detachWindow(win) {
  if (!win || !attachedWindows.has(win)) {
    return;
  }

  win.removeEventListener("keydown", onKeyDown, true);
  win.document.getElementById(MENU_ID)?.remove();
  win.document.getElementById(TOOLS_MENU_ID)?.remove();
  attachedWindows.delete(win);
}

async function getSelectedAttachmentPath() {
  const pane = Zotero.getActiveZoteroPane();
  const selectedItems = pane?.getSelectedItems() || [];
  if (!selectedItems.length) {
    throw new Error("Select an item or attachment first.");
  }

  const item = selectedItems[0];
  let attachment = item;

  if (!item.isAttachment()) {
    attachment = await item.getBestAttachment();
  }

  if (!attachment || attachment.isNote()) {
    throw new Error("The selected item has no previewable attachment.");
  }

  const path = await attachment.getFilePathAsync();
  if (!path) {
    throw new Error("The attachment is not available locally. Sync or download it, then try again.");
  }

  const exists = typeof IOUtils !== "undefined"
    ? await IOUtils.exists(path)
    : Zotero.File.pathToFile(path).exists();
  if (!exists) {
    throw new Error("The attachment file is missing from this device.");
  }

  return path;
}

function toBase64UTF16(value) {
  const bytes = [];
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    bytes.push(code & 0xff, code >> 8);
  }
  return btoa(String.fromCharCode(...bytes));
}

function toBase64UTF8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index++) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function parseCommandArguments(template, filePath) {
  const args = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;

  while ((match = pattern.exec(template))) {
    const argument = match[1] ?? match[2] ?? match[3];
    args.push(argument.split("{file}").join(filePath));
  }

  return args;
}

async function previewWithCustomCommand(path, command) {
  const executable = Zotero.File.pathToFile(command.trim());
  if (!executable.exists() || !executable.isExecutable()) {
    throw new Error(`The custom preview program is missing or not executable:\n${command}`);
  }

  const args = parseCommandArguments(getPref("customArguments", "{file}"), path);
  await Zotero.Utilities.Internal.exec(executable, args);
}

async function previewOnWindows(path) {
  const windowsDirectory = Services.env.get("WINDIR");
  if (!windowsDirectory) {
    throw new Error("Windows did not provide the WINDIR environment variable.");
  }

  const exec = Zotero.Utilities?.Internal?.exec;
  if (!exec) {
    throw new Error("This Zotero version does not expose its process launcher.");
  }

  const encodedPath = toBase64UTF8(path);
  const script = [
    "$ErrorActionPreference = 'Stop'",
    `$filePath = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encodedPath}'))`,
    "$pipeName = 'QuickLook.App.Pipe.' + [Security.Principal.WindowsIdentity]::GetCurrent().User.Value",
    "$pipe = [IO.Pipes.NamedPipeClientStream]::new('.', $pipeName, [IO.Pipes.PipeDirection]::Out)",
    "$writer = $null",
    "try {",
    "  $pipe.Connect(1000)",
    "  $writer = [IO.StreamWriter]::new($pipe, [Text.UTF8Encoding]::new($false))",
    "  $writer.WriteLine('QuickLook.App.PipeMessages.Toggle|' + $filePath)",
    "  $writer.Flush()",
    "} catch {",
    "  [Console]::Error.WriteLine('Cannot connect to QuickLook for Windows. Start the QL-Win QuickLook app and try again. ' + $_.Exception.Message)",
    "  exit 1",
    "} finally {",
    "  if ($writer) { $writer.Dispose() } else { $pipe.Dispose() }",
    "}"
  ].join("\n");

  const systemDirectory = `${windowsDirectory}\\System32`;
  const powershellPath = `${systemDirectory}\\WindowsPowerShell\\v1.0\\powershell.exe`;
  const scriptPath = PathUtils.join(
    PathUtils.tempDir,
    `zotero-quicklook-${Zotero.Utilities.randomString()}.vbs`
  );
  const launcherScript = [
    "Set shell = CreateObject(\"WScript.Shell\")",
    "Set args = WScript.Arguments",
    "If args.Count <> 2 Then WScript.Quit 2",
    "command = Chr(34) & args(0) & Chr(34) & \" -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand \" & args(1)",
    "WScript.Quit shell.Run(command, 0, True)"
  ].join("\r\n");
  await IOUtils.writeUTF8(scriptPath, launcherScript);

  try {
    await exec(`${systemDirectory}\\wscript.exe`, [
      scriptPath,
      powershellPath,
      toBase64UTF16(script)
    ]);
  }
  finally {
    await IOUtils.remove(scriptPath);
  }
}

async function launchPreview(path) {
  const exec = Zotero.Utilities?.Internal?.exec;
  if (!exec) {
    throw new Error("This Zotero version does not expose its process launcher.");
  }

  const legacyCommand = Zotero.Prefs.get("extensions.zoteroquicklook.customviewcommand", true);
  const customCommand = getPref("customCommand", legacyCommand || "").trim();
  if (customCommand) {
    await previewWithCustomCommand(path, customCommand);
    return;
  }

  if (Zotero.isWin) {
    await previewOnWindows(path);
    return;
  }
  if (Zotero.isMac) {
    await exec("/usr/bin/qlmanage", ["-p", path]);
    return;
  }
  if (Zotero.isLinux) {
    await exec("gloobus-preview", [path]);
    return;
  }

  const os = Services.appinfo.OS;
  throw new Error(`Unsupported operating system: ${os || "unknown"}.`);
}

async function previewSelection() {
  const path = await getSelectedAttachmentPath();
  await launchPreview(path);
}

async function startup({ id, version, rootURI }) {
  log("Starting");
  await Zotero.initializationPromise;
  await Zotero.PreferencePanes.register({
    pluginID: ADDON_ID,
    src: `${rootURI}preferences.xhtml`,
    scripts: [`${rootURI}preferences.js`],
    label: ADDON_NAME,
    image: `${rootURI}icons/icon-48.png`
  });
  for (const win of Zotero.getMainWindows()) {
    attachWindow(win);
  }
}

function onMainWindowLoad({ window }) {
  attachWindow(window);
}

function onMainWindowUnload({ window }) {
  detachWindow(window);
}

function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  for (const win of attachedWindows) {
    detachWindow(win);
  }
  log("Stopped");
}
