// CalmTube — main app logic

// ── Storage keys ──
const TIMER_START_KEY        = "calmtube_timer_start";
const TIMER_DURATION_KEY     = "calmtube_timer_duration";
const CHANNEL_SELECTION_KEY  = "calmtube_channel_selection";

// ── Timer helpers ──
function saveTimerStart(durationSeconds) {
  localStorage.setItem(TIMER_START_KEY,    Date.now().toString());
  localStorage.setItem(TIMER_DURATION_KEY, durationSeconds.toString());
}
function getRemainingSeconds() {
  const start    = parseInt(localStorage.getItem(TIMER_START_KEY)    || "0");
  const duration = parseInt(localStorage.getItem(TIMER_DURATION_KEY) || "0");
  if (!start || !duration) return null;
  return Math.max(0, duration - Math.floor((Date.now() - start) / 1000));
}
function clearTimerStorage() {
  localStorage.removeItem(TIMER_START_KEY);
  localStorage.removeItem(TIMER_DURATION_KEY);
}

// ── Firebase ──
firebase.initializeApp(CONFIG.FIREBASE);
const db = firebase.firestore();

// We identify users by their Google account ID (sub), fetched from userinfo API.
// Stored in localStorage so it survives page reloads within the same session.
const USER_ID_KEY = "calmtube_user_id";
let currentUserId = localStorage.getItem(USER_ID_KEY) || null;


async function loadChannelSelection() {
  // localStorage is the primary store — instant and no race conditions.
  const local = localStorage.getItem(CHANNEL_SELECTION_KEY);
  if (local !== null) {
    return local === "all" ? null : JSON.parse(local);
  }
  // No local record yet — try Firestore (returning user on a new device).
  if (!currentUserId) return undefined;
  try {
    const doc = await db.collection("users").doc(currentUserId).get();
    if (doc.exists && doc.data().selectedChannelIds !== undefined) {
      const sel = doc.data().selectedChannelIds;
      // Hydrate localStorage so future loads are instant.
      localStorage.setItem(CHANNEL_SELECTION_KEY, sel === null ? "all" : JSON.stringify(sel));
      return sel;
    }
    return undefined;
  } catch (err) {
    console.warn("Firestore load failed:", err);
    return undefined;
  }
}

async function saveChannelSelection(channelIds) {
  // Write to localStorage immediately so the change is visible right away.
  localStorage.setItem(CHANNEL_SELECTION_KEY, channelIds === null ? "all" : JSON.stringify(channelIds));
  // Sync to Firestore in the background for cross-device persistence.
  if (!currentUserId) return;
  try {
    await db.collection("users").doc(currentUserId).set({
      selectedChannelIds: channelIds,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync failed:", err);
  }
}

// ── State ──
let accessToken        = null;
let currentChannelId   = null;
let currentChannelTitle = null;
let currentSort        = "new";
let uploadsPlaylistId  = null;
let nextPageToken      = null;
let timerInterval      = null;
let selectedMinutes    = 30;

// ── Screen management ──
const screens = {
  login:           document.getElementById("login-screen"),
  loading:         document.getElementById("loading-screen"),
  channels:        document.getElementById("channels-screen"),
  channelDetail:   document.getElementById("channel-detail-screen"),
  player:          document.getElementById("player-screen"),
  timesup:         document.getElementById("timesup-screen"),
  channelSelector: document.getElementById("channel-selector-screen"),
  settings:        document.getElementById("settings-screen"),
  error:           document.getElementById("error-screen"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function showError(message) {
  document.getElementById("error-message").textContent = message;
  showScreen("error");
}

// ── Auth ──
let refreshTimeout = null;

async function initAuth() {
  const params = new URLSearchParams(location.search);
  if (params.get("auth_error")) {
    history.replaceState({}, "", "/");
    showScreen("login");
    return;
  }
  const isFreshLogin = params.get("fresh") === "1";
  if (isFreshLogin) {
    clearTimerStorage();
    history.replaceState({}, "", "/");
  }
  showScreen("loading");
  try {
    const res = await fetch("/api/token");
    if (res.ok) {
      const data = await res.json();
      accessToken   = data.access_token;
      currentUserId = data.user_id;
      localStorage.setItem(USER_ID_KEY, data.user_id);
      scheduleTokenRefresh(data.expires_in);
      loadSubscriptions();
      return;
    }
  } catch (err) {
    console.warn("Session check failed:", err);
  }
  showScreen("login");
}

function scheduleTokenRefresh(expiresIn) {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  const ms = Math.max((expiresIn - 300) * 1000, 30000);
  refreshTimeout = setTimeout(async () => {
    try {
      const res = await fetch("/api/token");
      if (res.ok) {
        const data = await res.json();
        accessToken = data.access_token;
        scheduleTokenRefresh(data.expires_in);
      } else {
        showScreen("login");
      }
    } catch (err) {
      console.warn("Token refresh failed:", err);
    }
  }, ms);
}

function startLogin() {
  const params = new URLSearchParams({
    client_id:     CONFIG.GOOGLE_CLIENT_ID,
    redirect_uri:  "https://calmtube.vercel.app/api/auth",
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/youtube.readonly openid",
    access_type:   "offline",
    prompt:        "consent",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// ── Global timer ──
function startGlobalTimer() {
  const remaining = getRemainingSeconds();

  if (remaining === null) {
    saveTimerStart(CONFIG.WATCH_TIMER_SECONDS);
    runTimer(CONFIG.WATCH_TIMER_SECONDS);
  } else if (remaining === 0) {
    clearTimerStorage();
    timeIsUp();
    return;
  } else {
    runTimer(remaining);
  }

  document.getElementById("global-timer").classList.remove("hidden");
  document.getElementById("settings-btn").classList.remove("hidden");
}

function runTimer(startSeconds) {
  let remaining = startSeconds;
  updateTimerDisplays(remaining);

  timerInterval = setInterval(() => {
    remaining--;
    updateTimerDisplays(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      clearTimerStorage();
      timeIsUp();
    }
  }, 1000);
}

function updateTimerDisplays(seconds) {
  const m = seconds <= 0 ? 0 : Math.ceil(seconds / 60);
  const text = `${m} min left`;
  const isWarning = seconds > 0 && seconds <= 300;

  const globalEl = document.getElementById("global-timer-display");
  const playerEl = document.getElementById("player-timer-display");
  globalEl.textContent = text;
  playerEl.textContent = text;
  globalEl.classList.toggle("timer-warning", isWarning);
  playerEl.classList.toggle("timer-warning", isWarning);
}

function timeIsUp() {
  document.getElementById("youtube-player").src = "";
  showScreen("timesup");
}

function resetTimer(durationSeconds) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearTimerStorage();
  saveTimerStart(durationSeconds);
  runTimer(durationSeconds);
  document.getElementById("global-timer").classList.remove("hidden");
}

// ── Parent reset modal ──
let resetModalOrigin = "header"; // "header" | "timesup"

function updatePinDisplay() {
  const input = document.getElementById("parent-reset-input");
  const val = input.value.replace(/\D/g, "").slice(0, 4);
  input.value = val;
  const focused = document.activeElement === input;
  for (let i = 0; i < 4; i++) {
    const box = document.getElementById(`pin-${i}`);
    box.classList.toggle("filled", i < val.length);
    box.classList.toggle("active", focused && i === val.length && val.length < 4);
  }
}

function openResetModal(origin = "header") {
  resetModalOrigin = origin;
  const isSettings = origin === "settings";

  // Show/hide timer presets depending on context
  document.querySelector(".preset-label").style.display  = isSettings ? "none" : "";
  document.querySelector(".time-presets").style.display  = isSettings ? "none" : "";

  // Update modal title
  document.querySelector("#parent-reset-modal h3").textContent =
    isSettings ? "Parent Settings" : "Parent Reset";

  selectedMinutes = Math.round(CONFIG.WATCH_TIMER_SECONDS / 60);
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.minutes) === selectedMinutes);
  });
  document.getElementById("parent-reset-input").value = "";
  updatePinDisplay();
  document.getElementById("parent-reset-error").classList.add("hidden");
  document.getElementById("parent-reset-modal").classList.remove("hidden");
  setTimeout(() => document.getElementById("parent-reset-input").focus(), 100);
}

function closeResetModal() {
  document.getElementById("parent-reset-modal").classList.add("hidden");
}

function confirmReset() {
  const entered = document.getElementById("parent-reset-input").value;
  if (entered === CONFIG.PARENT_CODE) {
    closeResetModal();
    if (resetModalOrigin === "settings") {
      openSettings();
    } else {
      resetTimer(selectedMinutes * 60);
      if (resetModalOrigin === "timesup") {
        history.replaceState({ screen: "channels" }, "");
        showScreen("channels");
      }
    }
  } else {
    document.getElementById("parent-reset-error").classList.remove("hidden");
    document.getElementById("parent-reset-input").value = "";
    document.getElementById("parent-reset-input").focus();
  }
}

// ── Settings ──
function openSettings() {
  updateSettingsChannelCount();
  showScreen("settings");
}

function updateSettingsChannelCount() {
  const el = document.getElementById("settings-channel-count");
  if (!el) return;
  const showing = document.querySelectorAll(".channel-card").length;
  const total   = allSubscriptions.length;
  el.textContent = showing === total ? "All channels" : `${showing} of ${total}`;
}

async function logout() {
  if (refreshTimeout) { clearTimeout(refreshTimeout); refreshTimeout = null; }
  clearTimerStorage();
  localStorage.removeItem(USER_ID_KEY);
  currentUserId = null;
  accessToken   = null;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  document.getElementById("global-timer").classList.add("hidden");
  document.getElementById("settings-btn").classList.add("hidden");
  try { await fetch("/api/logout"); } catch {}
  showScreen("login");
}

// ── Channel selector ──
let selectorSelectedIds = new Set();

function openChannelSelector() {
  // Pre-check whatever is currently showing
  const currentIds = Array.from(document.querySelectorAll(".channel-card"))
    .map(card => card.dataset.channelId)
    .filter(Boolean);

  // If nothing specific is saved, check all subscriptions
  const baseIds = currentIds.length
    ? currentIds
    : allSubscriptions.map(s => s.snippet.resourceId.channelId);

  selectorSelectedIds = new Set(baseIds);
  document.getElementById("selector-search").value = "";
  renderSelectorList();
  updateSelectorSaveBtn();
  showScreen("channelSelector");
}

function renderSelectorList(query = "") {
  const list = document.getElementById("selector-list");
  list.innerHTML = "";
  const q = query.toLowerCase();
  const filtered = allSubscriptions.filter(sub =>
    sub.snippet.title.toLowerCase().includes(q)
  );
  filtered.forEach(sub => {
    const id      = sub.snippet.resourceId.channelId;
    const title   = sub.snippet.title;
    const thumb   = sub.snippet.thumbnails.default?.url || sub.snippet.thumbnails.medium?.url;
    const checked = selectorSelectedIds.has(id);
    const row = document.createElement("div");
    row.className = "selector-row";
    row.innerHTML = `
      <img class="selector-avatar" src="${thumb}" alt="${title}">
      <span class="selector-channel-name">${title}</span>
      <div class="selector-checkbox ${checked ? "checked" : ""}">
        ${checked ? `<svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l3.5 3.5L12 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}
      </div>
    `;
    row.addEventListener("click", () => {
      if (selectorSelectedIds.has(id)) {
        selectorSelectedIds.delete(id);
      } else {
        selectorSelectedIds.add(id);
      }
      renderSelectorList(document.getElementById("selector-search").value);
      updateSelectorSaveBtn();
    });
    list.appendChild(row);
  });

  // Update select-all button label
  const allVisible = filtered.every(s => selectorSelectedIds.has(s.snippet.resourceId.channelId));
  document.getElementById("selector-select-all").textContent = allVisible ? "Deselect all" : "Select all";
}

function updateSelectorSaveBtn() {
  const count = selectorSelectedIds.size;
  const total = allSubscriptions.length;
  const btn = document.getElementById("selector-save");
  btn.textContent = count === total
    ? "Show all channels"
    : `Save ${count} channel${count !== 1 ? "s" : ""}`;
}

async function selectorSave() {
  const selectedIds = Array.from(selectorSelectedIds);
  const saveAll = selectedIds.length === allSubscriptions.length;
  await saveChannelSelection(saveAll ? null : selectedIds);

  // Render immediately from in-memory list — no need to re-fetch from YouTube.
  if (saveAll) {
    renderChannels(allSubscriptions);
  } else {
    const filtered = allSubscriptions.filter(sub =>
      selectedIds.includes(sub.snippet.resourceId.channelId)
    );
    renderChannels(filtered.length ? filtered : allSubscriptions);
  }
  updateSettingsChannelCount();
}

// ── Subscriptions ──
let allSubscriptions = []; // cached for channel selector

async function loadSubscriptions() {
  showScreen("loading");
  try {
    const subscriptions = [];
    let pageToken = "";
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("order", "alphabetical");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      subscriptions.push(...data.items);
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    allSubscriptions = subscriptions;

    const selection = await loadChannelSelection();
    if (selection === undefined) {
      // First time — show all channels, Firestore record will be created on first settings save
      renderChannels(subscriptions);
    } else if (selection === null || selection.length === 0) {
      // Explicitly set to show all
      renderChannels(subscriptions);
    } else {
      // Filter to saved selection
      const filtered = subscriptions.filter(sub =>
        selection.includes(sub.snippet.resourceId.channelId)
      );
      renderChannels(filtered.length ? filtered : subscriptions);
    }

    startGlobalTimer();
  } catch (err) {
    console.error(err);
    showError("Could not load channels. Please try again.");
  }
}

function renderChannels(subscriptions) {
  const grid = document.getElementById("channels-grid");
  grid.innerHTML = "";
  if (subscriptions.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:40px 0;">No subscribed channels found.</p>';
  } else {
    subscriptions.forEach(sub => {
      const channelId = sub.snippet.resourceId.channelId;
      const title     = sub.snippet.title;
      const thumb     = sub.snippet.thumbnails.medium.url;
      const card = document.createElement("div");
      card.className = "channel-card";
      card.dataset.channelId = channelId;
      card.innerHTML = `
        <img class="channel-thumb" src="${thumb}" alt="${title}">
        <div class="channel-name">${title}</div>
      `;
      card.addEventListener("click", () => openChannel(channelId, title, thumb));
      grid.appendChild(card);
    });
  }
  history.replaceState({ screen: "channels" }, "");
  showScreen("channels");
}

// ── Channel detail ──
async function openChannel(channelId, title, avatarUrl = "") {
  currentChannelId    = channelId;
  currentChannelTitle = title;
  currentSort         = "new";
  uploadsPlaylistId   = null;
  nextPageToken       = null;

  document.getElementById("channel-detail-title").textContent = title;
  const avatarEl = document.getElementById("channel-detail-avatar");
  avatarEl.src = avatarUrl;
  avatarEl.alt = title;
  document.getElementById("sort-new").classList.add("active");
  document.getElementById("sort-popular").classList.remove("active");
  document.getElementById("videos-grid").innerHTML = "";
  document.getElementById("load-more-container").classList.add("hidden");

  document.getElementById("channel-detail-body").scrollTop = 0;
  history.pushState({ screen: "channelDetail", channelId, channelTitle: title }, "");
  showScreen("channelDetail");
  await loadVideos(false);
}

async function loadVideos(append) {
  if (!append) {
    document.getElementById("videos-grid").innerHTML =
      '<p style="grid-column:1/-1;color:#9CA3AF;padding:20px 0;font-weight:600;">Loading videos…</p>';
  }
  document.getElementById("load-more-container").classList.add("hidden");
  try {
    currentSort === "new" ? await fetchNewVideos(append) : await fetchPopularVideos(append);
  } catch (err) {
    console.error(err);
    document.getElementById("videos-grid").innerHTML =
      '<p style="grid-column:1/-1;color:#DC2626;padding:20px 0;">Could not load videos. Go back and try again.</p>';
  }
}

async function getUploadsPlaylistId(channelId) {
  if (uploadsPlaylistId) return uploadsPlaylistId;
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Channels API error: ${res.status}`);
  const data = await res.json();
  uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
  return uploadsPlaylistId;
}

async function fetchNewVideos(append) {
  const playlistId = await getUploadsPlaylistId(currentChannelId);
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "15");
  if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`PlaylistItems error: ${res.status}`);
  const data = await res.json();
  nextPageToken = data.nextPageToken || null;
  const videoIds = data.items.map(i => i.snippet.resourceId.videoId);
  const stats    = await fetchVideoStats(videoIds);
  const videos   = data.items.map(i => ({
    videoId:     i.snippet.resourceId.videoId,
    title:       i.snippet.title,
    thumb:       i.snippet.thumbnails.high?.url || i.snippet.thumbnails.medium?.url || "",
    publishedAt: i.snippet.publishedAt,
  }));
  renderVideos(videos, stats, append);
}

async function fetchPopularVideos(append) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", currentChannelId);
  url.searchParams.set("order", "viewCount");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "15");
  if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Search API error: ${res.status}`);
  const data = await res.json();
  nextPageToken = data.nextPageToken || null;
  const videoIds = data.items.map(i => i.id.videoId);
  const stats    = await fetchVideoStats(videoIds);
  const videos   = data.items.map(i => ({
    videoId:     i.id.videoId,
    title:       i.snippet.title,
    thumb:       i.snippet.thumbnails.high?.url || i.snippet.thumbnails.medium?.url || "",
    publishedAt: i.snippet.publishedAt,
  }));
  renderVideos(videos, stats, append);
}

async function fetchVideoStats(videoIds) {
  if (!videoIds.length) return {};
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "statistics,contentDetails");
  url.searchParams.set("id", videoIds.join(","));
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return {};
  const data = await res.json();
  const map  = {};
  data.items.forEach(item => {
    map[item.id] = {
      viewCount: item.statistics.viewCount || "0",
      duration:  parseDuration(item.contentDetails.duration),
    };
  });
  return map;
}

function renderVideos(videos, stats, append) {
  const grid = document.getElementById("videos-grid");
  if (!append) grid.innerHTML = "";
  videos.forEach(video => {
    const s       = stats[video.videoId] || {};
    const views   = s.viewCount ? formatViewCount(s.viewCount) : "";
    const duration = s.duration || "";
    const age     = timeAgo(video.publishedAt);
    const card    = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <div class="video-thumb-wrapper">
        <img class="video-thumb" src="${video.thumb}" alt="${video.title}" loading="lazy">
        ${duration ? `<span class="video-duration">${duration}</span>` : ""}
      </div>
      <div class="video-info">
        <div class="video-title">${video.title}</div>
        <div class="video-meta">${[views, age].filter(Boolean).join(" · ")}</div>
      </div>
    `;
    card.addEventListener("click", () => openPlayer(video.videoId));
    grid.appendChild(card);
  });
  document.getElementById("load-more-container").classList.toggle("hidden", !nextPageToken);
}

function setSort(sort) {
  if (sort === currentSort) return;
  currentSort   = sort;
  nextPageToken = null;
  document.getElementById("sort-new").classList.toggle("active", sort === "new");
  document.getElementById("sort-popular").classList.toggle("active", sort === "popular");
  loadVideos(false);
}

// ── Player ──
function openPlayer(videoId) {
  const iframe = document.getElementById("youtube-player");
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  history.pushState({ screen: "player" }, "");
  showScreen("player");
}

// ── Utilities ──
function parseDuration(iso) {
  if (!iso) return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${m}:${String(s).padStart(2,"0")}`;
}

function formatViewCount(count) {
  const n = parseInt(count);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M views`;
  if (n >= 1000)    return `${Math.round(n / 1000)}K views`;
  return `${n} views`;
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const intervals = [
    [31536000, "year"], [2592000, "month"], [604800, "week"],
    [86400, "day"],     [3600, "hour"],     [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// ── Event listeners ──
document.getElementById("login-button").addEventListener("click", startLogin);
document.getElementById("retry-button").addEventListener("click", () => showScreen("login"));

// Gear icon — PIN-gated, then opens settings
document.getElementById("settings-btn").addEventListener("click", () => openResetModal("settings"));

// Settings screen
document.getElementById("settings-back").addEventListener("click", () => showScreen("channels"));
document.getElementById("settings-edit-channels").addEventListener("click", () => {
  showScreen("channelSelector");
  openChannelSelector();
});
document.getElementById("settings-logout").addEventListener("click", logout);

// Channel selector
document.getElementById("selector-close").addEventListener("click", () => showScreen("channels"));
document.getElementById("selector-search").addEventListener("input", e => {
  renderSelectorList(e.target.value);
  updateSelectorSaveBtn();
});
document.getElementById("selector-select-all").addEventListener("click", () => {
  const q = document.getElementById("selector-search").value.toLowerCase();
  const visible = allSubscriptions.filter(s => s.snippet.title.toLowerCase().includes(q));
  const allChecked = visible.every(s => selectorSelectedIds.has(s.snippet.resourceId.channelId));
  visible.forEach(s => {
    const id = s.snippet.resourceId.channelId;
    allChecked ? selectorSelectedIds.delete(id) : selectorSelectedIds.add(id);
  });
  renderSelectorList(document.getElementById("selector-search").value);
  updateSelectorSaveBtn();
});
document.getElementById("selector-save").addEventListener("click", selectorSave);

document.getElementById("back-to-channels").addEventListener("click", () => {
  history.back();
  showScreen("channels");
});

document.getElementById("sort-new").addEventListener("click",     () => setSort("new"));
document.getElementById("sort-popular").addEventListener("click", () => setSort("popular"));
document.getElementById("load-more-button").addEventListener("click", () => loadVideos(true));

document.getElementById("back-to-channel").addEventListener("click", () => {
  document.getElementById("youtube-player").src = "";
  history.back();
  showScreen("channelDetail"); // Show immediately, don't wait for popstate
});

// Timer pill (whole pill) + player timer + timesup illustration
document.getElementById("global-timer").addEventListener("click", () => openResetModal("header"));
document.getElementById("player-reset-btn").addEventListener("click", (e) => { e.stopPropagation(); openResetModal("header"); });
document.getElementById("timer-display").addEventListener("click", () => openResetModal("header"));
document.getElementById("timesup-illustration").addEventListener("click", () => openResetModal("timesup"));
document.getElementById("parent-reset-cancel").addEventListener("click",  closeResetModal);
document.getElementById("parent-reset-confirm").addEventListener("click", confirmReset);

// Preset time buttons
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMinutes = parseInt(btn.dataset.minutes);
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// PIN input: update dots, auto-submit on 4 digits
document.getElementById("parent-reset-input").addEventListener("input", () => {
  updatePinDisplay();
  if (document.getElementById("parent-reset-input").value.length === 4) {
    setTimeout(confirmReset, 180);
  }
});
document.getElementById("parent-reset-input").addEventListener("focus", updatePinDisplay);
document.getElementById("parent-reset-input").addEventListener("blur", () => {
  for (let i = 0; i < 4; i++) document.getElementById(`pin-${i}`).classList.remove("active");
});
document.getElementById("parent-reset-input").addEventListener("keydown", e => {
  if (e.key === "Enter") confirmReset();
});

// Browser back button
window.addEventListener("popstate", event => {
  const state = event.state;
  if (!state) return;
  document.getElementById("youtube-player").src = "";
  if (state.screen === "channels")      showScreen("channels");
  if (state.screen === "channelDetail") showScreen("channelDetail");
});

initAuth();
