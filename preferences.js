/* global Zotero */

window.ZoteroQuickLookPrefs = {
  init() {
    const prefs = this;
    const checkbox = document.getElementById("zql-enabled");
    const shortcut = document.getElementById("zql-shortcut");
    const command = document.getElementById("zql-command");
    const argumentsInput = document.getElementById("zql-arguments");

    checkbox.checked = Zotero.Prefs.get("extensions.zoteroquicklook10.enabled", true) ?? true;
    shortcut.value = Zotero.Prefs.get("extensions.zoteroquicklook10.shortcut", true) ?? "Space";
    command.value = Zotero.Prefs.get("extensions.zoteroquicklook10.customCommand", true)
      ?? Zotero.Prefs.get("extensions.zoteroquicklook.customviewcommand", true)
      ?? "";
    argumentsInput.value = Zotero.Prefs.get("extensions.zoteroquicklook10.customArguments", true) ?? "{file}";

    document.getElementById("zql-save").addEventListener("command", () => prefs.save({
      enabled: checkbox.checked,
      shortcut: shortcut.value.trim(),
      customCommand: command.value.trim(),
      customArguments: argumentsInput.value
    }));
  },

  save(settings) {
    Zotero.Prefs.set("extensions.zoteroquicklook10.enabled", settings.enabled, true);
    Zotero.Prefs.set("extensions.zoteroquicklook10.shortcut", settings.shortcut, true);
    Zotero.Prefs.set("extensions.zoteroquicklook10.customCommand", settings.customCommand, true);
    Zotero.Prefs.set("extensions.zoteroquicklook10.customArguments", settings.customArguments, true);
    document.getElementById("zql-status").textContent = "设置已保存。";
  }
};
