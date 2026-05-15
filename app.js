// CalmTube — main app logic

// ── Storage keys ──
const TIMER_START_KEY    = "calmtube_timer_start";
const TIMER_DURATION_KEY = "calmtube_timer_duration";
const USER_ID_KEY        = "calmtube_user_id";
const CHANNEL_LIST_KEY   = "calmtube_channels";

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

let currentUserId = localStorage.getItem(USER_ID_KEY) || null;

// ── Channel list (in memory) ──
// Each entry: { channelId, title, thumbnail }
let allChannels = [];
let defaultChannelDetails = null; // cached once per session

// ── Default recommended channels ──
const DEFAULT_CHANNEL_IDS = [
  "UCpVm7bg6pXKo1Pr6k5kxG9A", // National Geographic
  "UCwmZiChSryoWQCZPIJlaVGQ", // BBC Earth
];

// ── YouTube API (via server-side proxy) ──
async function ytFetch(endpoint, params) {
  const url = new URL("/api/yt", location.origin);
  url.searchParams.set("endpoint", endpoint);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error ${res.status}`);
  return res.json();
}

async function fetchChannelDetails(channelIds) {
  if (!channelIds.length) return [];
  const data = await ytFetch("channels", {
    part:       "snippet",
    id:         channelIds.join(","),
    maxResults: 50,
  });
  return (data.items || []).map(item => ({
    channelId: item.id,
    title:     item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || "",
  }));
}

async function getDefaultChannels() {
  if (defaultChannelDetails) return defaultChannelDetails;
  defaultChannelDetails = await fetchChannelDetails(DEFAULT_CHANNEL_IDS);
  return defaultChannelDetails;
}

// ── Channel list persistence ──
async function loadChannelList() {
  // 1. localStorage cache — instant
  const cached = localStorage.getItem(CHANNEL_LIST_KEY);
  if (cached) {
    allChannels = JSON.parse(cached);
    renderChannels(allChannels);
    startGlobalTimer();
    return;
  }
  // 2. Firestore — returning user on a new device
  if (currentUserId) {
    try {
      const doc = await db.collection("users").doc(currentUserId).get();
      if (doc.exists && Array.isArray(doc.data().channels) && doc.data().channels.length > 0) {
        allChannels = doc.data().channels;
        localStorage.setItem(CHANNEL_LIST_KEY, JSON.stringify(allChannels));
        renderChannels(allChannels);
        startGlobalTimer();
        return;
      }
    } catch (err) {
      console.warn("Firestore load failed:", err);
    }
  }
  // 3. New user — pre-load defaults, show selector
  showScreen("loading");
  try {
    allChannels = await getDefaultChannels();
  } catch {
    allChannels = [];
  }
  openChannelSelector(true);
}

async function saveChannelList() {
  localStorage.setItem(CHANNEL_LIST_KEY, JSON.stringify(allChannels));
  if (!currentUserId) return;
  try {
    await db.collection("users").doc(currentUserId).set({
      channels:  allChannels,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore save failed:", err);
  }
}

// ── State ──
let currentChannelId    = null;
let currentChannelTitle = null;
let currentSort         = "new";
let uploadsPlaylistId   = null;
let nextPageToken       = null;
let timerInterval       = null;
let selectedMinutes     = 30;

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
      currentUserId = data.user_id;
      localStorage.setItem(USER_ID_KEY, data.user_id);
      await loadChannelList();
      return;
    }
  } catch (err) {
    console.warn("Session check failed:", err);
  }
  showScreen("login");
}

function startLogin() {
  const params = new URLSearchParams({
    client_id:     CONFIG.GOOGLE_CLIENT_ID,
    redirect_uri:  "https://calmtube.vercel.app/api/auth",
    response_type: "code",
    scope:         "openid email profile",
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
let resetModalOrigin = "header";

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

  document.querySelector(".preset-label").style.display  = isSettings ? "none" : "";
  document.querySelector(".time-presets").style.display  = isSettings ? "none" : "";
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
  const n = allChannels.length;
  el.textContent = `${n} channel${n !== 1 ? "s" : ""}`;
}

async function logout() {
  clearTimerStorage();
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(CHANNEL_LIST_KEY);
  currentUserId = null;
  allChannels   = [];
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  document.getElementById("global-timer").classList.add("hidden");
  document.getElementById("settings-btn").classList.add("hidden");
  try { await fetch("/api/logout"); } catch {}
  showScreen("login");
}

// ── Channel selector ──
let selectorIsFirstTime = false;
let searchDebounce = null;

async function openChannelSelector(firstTime = false) {
  selectorIsFirstTime = firstTime;
  document.getElementById("selector-close").textContent = "Done";
  document.getElementById("selector-search").value = "";
  document.getElementById("selector-search-results").classList.add("hidden");
  renderSelectorMyChannels();
  showScreen("channelSelector");
  // Load recommended in background
  try {
    const defaults = await getDefaultChannels();
    renderSelectorRecommended(defaults);
  } catch {
    document.getElementById("selector-recommended").innerHTML = "";
  }
}

function renderSelectorMyChannels() {
  const list = document.getElementById("selector-list");
  list.innerHTML = "";
  if (allChannels.length === 0) {
    list.innerHTML = '<p class="selector-empty">No channels yet — search above or add from Recommended.</p>';
    return;
  }
  allChannels.forEach(ch => {
    const row = document.createElement("div");
    row.className = "selector-row";
    row.innerHTML = `
      <img class="selector-avatar" src="${ch.thumbnail}" alt="${ch.title}" onerror="this.style.opacity='0'">
      <span class="selector-channel-name">${ch.title}</span>
      <button class="selector-remove-btn" aria-label="Remove ${ch.title}">✕</button>
    `;
    row.querySelector(".selector-remove-btn").addEventListener("click", () => removeChannel(ch.channelId));
    list.appendChild(row);
  });
}

function renderSelectorRecommended(defaults) {
  const list = document.getElementById("selector-recommended");
  list.innerHTML = "";
  const addedIds = new Set(allChannels.map(c => c.channelId));
  const available = defaults.filter(c => !addedIds.has(c.channelId));
  if (available.length === 0) {
    list.innerHTML = '<p class="selector-empty">You\'ve added all recommended channels.</p>';
    return;
  }
  available.forEach(ch => {
    const row = document.createElement("div");
    row.className = "selector-row";
    row.innerHTML = `
      <img class="selector-avatar" src="${ch.thumbnail}" alt="${ch.title}" onerror="this.style.opacity='0'">
      <span class="selector-channel-name">${ch.title}</span>
      <button class="selector-add-btn" aria-label="Add ${ch.title}">+</button>
    `;
    row.querySelector(".selector-add-btn").addEventListener("click", () => addChannel(ch));
    list.appendChild(row);
  });
}

async function handleSearchInput(query) {
  const resultsEl = document.getElementById("selector-search-results");
  if (!query.trim()) {
    resultsEl.classList.add("hidden");
    resultsEl.innerHTML = "";
    return;
  }
  resultsEl.innerHTML = '<div class="selector-search-status">Searching…</div>';
  resultsEl.classList.remove("hidden");
  try {
    const data = await ytFetch("search", {
      part:       "snippet",
      type:       "channel",
      q:          query,
      maxResults: 6,
    });
    const addedIds = new Set(allChannels.map(c => c.channelId));
    resultsEl.innerHTML = "";
    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = '<div class="selector-search-status">No results</div>';
      return;
    }
    data.items.forEach(item => {
      const channelId = item.snippet.channelId;
      const title     = item.snippet.channelTitle;
      const thumbnail = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || "";
      const isAdded   = addedIds.has(channelId);
      const row = document.createElement("div");
      row.className = "selector-row";
      row.innerHTML = `
        <img class="selector-avatar" src="${thumbnail}" alt="${title}" onerror="this.style.opacity='0'">
        <span class="selector-channel-name">${title}</span>
        ${isAdded
          ? '<span class="selector-added-badge">Added</span>'
          : '<button class="selector-add-btn">+</button>'}
      `;
      if (!isAdded) {
        row.querySelector(".selector-add-btn").addEventListener("click", () => {
          addChannel({ channelId, title, thumbnail });
          resultsEl.classList.add("hidden");
          document.getElementById("selector-search").value = "";
        });
      }
      resultsEl.appendChild(row);
    });
  } catch {
    resultsEl.innerHTML = '<div class="selector-search-status">Search failed — try again</div>';
  }
}

async function addChannel(channel) {
  if (allChannels.some(c => c.channelId === channel.channelId)) return;
  allChannels = [...allChannels, channel];
  await saveChannelList();
  renderSelectorMyChannels();
  if (defaultChannelDetails) renderSelectorRecommended(defaultChannelDetails);
}

async function removeChannel(channelId) {
  allChannels = allChannels.filter(c => c.channelId !== channelId);
  await saveChannelList();
  renderSelectorMyChannels();
  if (defaultChannelDetails) renderSelectorRecommended(defaultChannelDetails);
}

async function selectorDone() {
  if (allChannels.length === 0) {
    // Don't let user save an empty list
    document.getElementById("selector-list").innerHTML =
      '<p class="selector-empty selector-error">Add at least one channel to continue.</p>';
    return;
  }
  await saveChannelList();
  renderChannels(allChannels);
  if (selectorIsFirstTime) {
    startGlobalTimer();
  } else {
    updateSettingsChannelCount();
  }
}

// ── Channels grid ──
function renderChannels(channels) {
  const grid = document.getElementById("channels-grid");
  grid.innerHTML = "";
  if (channels.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:40px 0;">No channels yet.</p>';
  } else {
    channels.forEach(ch => {
      const card = document.createElement("div");
      card.className = "channel-card";
      card.dataset.channelId = ch.channelId;
      card.innerHTML = `
        <img class="channel-thumb" src="${ch.thumbnail}" alt="${ch.title}">
        <div class="channel-name">${ch.title}</div>
      `;
      card.addEventListener("click", () => openChannel(ch.channelId, ch.title, ch.thumbnail));
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
  const data = await ytFetch("channels", { part: "contentDetails", id: channelId });
  uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
  return uploadsPlaylistId;
}

async function fetchNewVideos(append) {
  const playlistId = await getUploadsPlaylistId(currentChannelId);
  const data = await ytFetch("playlistItems", {
    part:       "snippet",
    playlistId,
    maxResults: 15,
    pageToken:  nextPageToken || "",
  });
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
  const data = await ytFetch("search", {
    part:      "snippet",
    channelId: currentChannelId,
    order:     "viewCount",
    type:      "video",
    maxResults: 15,
    pageToken:  nextPageToken || "",
  });
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
  const data = await ytFetch("videos", {
    part: "statistics,contentDetails",
    id:   videoIds.join(","),
  });
  const map = {};
  (data.items || []).forEach(item => {
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
    const s        = stats[video.videoId] || {};
    const views    = s.viewCount ? formatViewCount(s.viewCount) : "";
    const duration = s.duration || "";
    const age      = timeAgo(video.publishedAt);
    const card     = document.createElement("div");
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

document.getElementById("settings-btn").addEventListener("click", () => openResetModal("settings"));

document.getElementById("settings-back").addEventListener("click", () => showScreen("channels"));
document.getElementById("settings-edit-channels").addEventListener("click", () => openChannelSelector(false));
document.getElementById("settings-logout").addEventListener("click", logout);

document.getElementById("selector-close").addEventListener("click", selectorDone);

document.getElementById("selector-search").addEventListener("input", e => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => handleSearchInput(e.target.value), 300);
});

// Hide search results when clicking outside
document.addEventListener("click", e => {
  const searchWrap = document.getElementById("selector-search-wrap");
  if (searchWrap && !searchWrap.contains(e.target)) {
    document.getElementById("selector-search-results").classList.add("hidden");
  }
});

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
  showScreen("channelDetail");
});

document.getElementById("global-timer").addEventListener("click", () => openResetModal("header"));
document.getElementById("player-reset-btn").addEventListener("click", (e) => { e.stopPropagation(); openResetModal("header"); });
document.getElementById("timer-display").addEventListener("click", () => openResetModal("header"));
document.getElementById("timesup-illustration").addEventListener("click", () => openResetModal("timesup"));
document.getElementById("parent-reset-cancel").addEventListener("click",  closeResetModal);
document.getElementById("parent-reset-confirm").addEventListener("click", confirmReset);

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMinutes = parseInt(btn.dataset.minutes);
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

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

window.addEventListener("popstate", event => {
  const state = event.state;
  if (!state) return;
  document.getElementById("youtube-player").src = "";
  if (state.screen === "channels")      showScreen("channels");
  if (state.screen === "channelDetail") showScreen("channelDetail");
});

initAuth();
