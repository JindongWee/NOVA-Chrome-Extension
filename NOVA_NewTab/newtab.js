const DEFAULT_SHORTCUTS = [
  { name: "Google", url: "https://www.google.com", mark: "G" },
  { name: "YouTube", url: "https://www.youtube.com", mark: "▶" },
  { name: "GitHub", url: "https://github.com", mark: "GH" },
  { name: "ChatGPT", url: "https://chatgpt.com", mark: "AI" },
  { name: "Gmail", url: "https://mail.google.com", mark: "M" },
  { name: "Drive", url: "https://drive.google.com", mark: "D" }
];
const SEARCH_URLS = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  duck: "https://duckduckgo.com/?q="
};
const ENGINE_META = {
  google: { name: "Google", mark: "G" },
  bing: { name: "Bing", mark: "b" },
  duck: { name: "DuckDuckGo", mark: "D" }
};

const $ = (selector) => document.querySelector(selector);
const state = {
  engine: "google",
  wallpaper: "aurora",
  accent: "blue",
  customWallpaper: "",
  shortcuts: DEFAULT_SHORTCUTS
};

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

async function loadSettings() {
  const saved = await chrome.storage.local.get([
    "engine", "wallpaper", "accent", "customWallpaper", "shortcuts"
  ]);
  Object.assign(state, saved);
  if (!Array.isArray(state.shortcuts)) state.shortcuts = [...DEFAULT_SHORTCUTS];
  state.shortcuts = state.shortcuts
    .filter(item => item && typeof item.name === "string" && safeUrl(item.url))
    .slice(0, 8)
    .map(item => ({ name: item.name.slice(0, 14), url: safeUrl(item.url), mark: item.mark || item.name.slice(0, 2).toUpperCase() }));
  applySettings();
}

async function saveSettings() {
  await chrome.storage.local.set({
    engine: state.engine,
    wallpaper: state.wallpaper,
    accent: state.accent,
    customWallpaper: state.customWallpaper,
    shortcuts: state.shortcuts
  });
  $("#saveStatus").textContent = "已保存到本机";
}

function applySettings() {
  document.body.dataset.wallpaper = state.customWallpaper && state.wallpaper === "custom" ? "custom" : state.wallpaper;
  document.body.dataset.accent = state.accent;
  if (state.customWallpaper && state.wallpaper === "custom") {
    document.body.style.backgroundImage = `linear-gradient(rgba(5,10,18,.50),rgba(5,10,18,.58)),url("${state.customWallpaper}")`;
  } else {
    document.body.style.backgroundImage = "";
  }
  const meta = ENGINE_META[state.engine] || ENGINE_META.google;
  $("#engineName").textContent = meta.name;
  $("#engineGlyph").textContent = meta.mark;
  $("#engineGlyph").className = "engine-glyph" + (state.engine === "bing" ? " bing" : state.engine === "duck" ? " duck" : "");
  $("#engineSelect").value = state.engine;
  document.querySelectorAll(".wallpaper-choice").forEach(btn => btn.classList.toggle("selected", btn.dataset.wallpaper === state.wallpaper));
  document.querySelectorAll(".accent-choice").forEach(btn => btn.classList.toggle("selected", btn.dataset.accent === state.accent));
  renderShortcuts();
  renderShortcutEditor();
}

function updateClock() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const ss = now.toLocaleTimeString("zh-CN", { second: "2-digit", hour12: false });
  $("#clock").innerHTML = `${hhmm}<span class="clock-seconds">:${ss}</span>`;
  $("#dateText").textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  }).format(now);
  const hour = now.getHours();
  $("#greeting").textContent = hour < 6 ? "夜深了，注意休息。" : hour < 11 ? "早上好，开始今天的探索。" : hour < 14 ? "中午好，保持节奏。" : hour < 19 ? "下午好，继续专注。" : "晚上好，给自己一点时间。";
  $("#footerDate").textContent = `NOVA / ${String(now.getMonth()+1).padStart(2,"0")}`;
}

function renderShortcuts() {
  const grid = $("#shortcutGrid");
  grid.replaceChildren();
  state.shortcuts.forEach(item => {
    const link = document.createElement("a");
    link.className = "shortcut-item";
    link.href = item.url;
    link.title = item.url;
    const icon = document.createElement("span");
    icon.className = "shortcut-icon";
    icon.textContent = item.mark || item.name.slice(0, 2).toUpperCase();
    const label = document.createElement("span");
    label.className = "shortcut-label";
    label.textContent = item.name;
    link.append(icon, label);
    grid.append(link);
  });
}

function renderShortcutEditor() {
  const editor = $("#shortcutEditor");
  editor.replaceChildren();
  state.shortcuts.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "shortcut-edit-row";
    const icon = document.createElement("span");
    icon.className = "edit-icon";
    icon.textContent = item.mark || item.name.slice(0, 2).toUpperCase();
    const name = document.createElement("span");
    name.className = "edit-name";
    name.textContent = item.name;
    const url = document.createElement("span");
    url.className = "edit-url";
    url.textContent = new URL(item.url).hostname;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.title = "删除入口";
    remove.setAttribute("aria-label", `删除${item.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", async () => {
      state.shortcuts.splice(index, 1);
      await saveSettings();
      renderShortcuts();
      renderShortcutEditor();
    });
    row.append(icon, name, url, remove);
    editor.append(row);
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function openSettings() {
  $("#modalBackdrop").hidden = false;
  renderShortcutEditor();
}
function closeSettings() {
  $("#modalBackdrop").hidden = true;
}

$("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("#searchInput").value.trim();
  if (!query) {
    $("#searchInput").focus();
    return;
  }
  const engine = SEARCH_URLS[state.engine] || SEARCH_URLS.google;
  window.location.href = engine + encodeURIComponent(query);
});
$("#engineBtn").addEventListener("click", () => {
  $("#engineMenu").hidden = !$("#engineMenu").hidden;
});
$("#engineMenu").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-engine]");
  if (!button) return;
  state.engine = button.dataset.engine;
  await saveSettings();
  applySettings();
  $("#engineMenu").hidden = true;
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-box")) $("#engineMenu").hidden = true;
});

$("#settingsBtn").addEventListener("click", openSettings);
$("#closeSettings").addEventListener("click", closeSettings);
$("#doneSettings").addEventListener("click", closeSettings);
$("#modalBackdrop").addEventListener("click", event => {
  if (event.target === $("#modalBackdrop")) closeSettings();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSettings();
});

document.querySelectorAll(".wallpaper-choice").forEach(button => {
  button.addEventListener("click", async () => {
    state.wallpaper = button.dataset.wallpaper;
    if (state.wallpaper !== "custom") state.customWallpaper = "";
    await saveSettings();
    applySettings();
  });
});
document.querySelectorAll(".accent-choice").forEach(button => {
  button.addEventListener("click", async () => {
    state.accent = button.dataset.accent;
    await saveSettings();
    applySettings();
  });
});
$("#engineSelect").addEventListener("change", async event => {
  state.engine = event.target.value;
  await saveSettings();
  applySettings();
});
$("#wallpaperUpload").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    showToast("图片超过 3 MB，请选择较小的图片。");
    event.target.value = "";
    return;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("请选择 JPG、PNG 或 WebP 图片。");
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    state.customWallpaper = String(reader.result);
    state.wallpaper = "custom";
    await saveSettings();
    applySettings();
    showToast("壁纸已应用并保存在本机。");
  };
  reader.readAsDataURL(file);
});
$("#clearWallpaper").addEventListener("click", async () => {
  state.customWallpaper = "";
  state.wallpaper = "aurora";
  await saveSettings();
  applySettings();
  showToast("已恢复默认背景。");
});

$("#addShortcutForm").addEventListener("submit", async event => {
  event.preventDefault();
  const name = $("#shortcutName").value.trim();
  let url = $("#shortcutUrl").value.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  url = safeUrl(url);
  if (!name || !url) {
    showToast("请填写有效的网站名称和 http/https 地址。");
    return;
  }
  if (state.shortcuts.length >= 8) {
    showToast("最多添加 8 个快捷入口。");
    return;
  }
  state.shortcuts.push({ name: name.slice(0,14), url, mark: name.slice(0,2).toUpperCase() });
  await saveSettings();
  applySettings();
  $("#shortcutName").value = "";
  $("#shortcutUrl").value = "";
  showToast("快捷入口已添加。");
});

loadSettings();
updateClock();
window.setInterval(updateClock, 1000);