// CalmTube — main app logic

// ── Storage keys ──
const TOKEN_KEY         = "calmtube_token";
const TOKEN_EXPIRY_KEY  = "calmtube_token_expiry";
const TIMER_START_KEY   = "calmtube_timer_start";
const TIMER_DURATION_KEY = "calmtube_timer_duration";

// ── Token helpers ──
function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now() + 55 * 60 * 1000);
}
function getStoredToken() {
  const token  = localStorage.getItem(TOKEN_KEY);
  const expiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || "0");
  return token && Date.now() < expiry ? token : null;
}
function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

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

// ── State ──
let accessToken        = null;
let tokenClient        = null;
let currentChannelId   = null;
let currentChannelTitle = null;
let currentSort        = "new";
let uploadsPlaylistId  = null;
let nextPageToken      = null;
let timerInterval      = null;
let selectedMinutes    = 30;

// ── Screen management ──
const screens = {
  login:         document.getElementById("login-screen"),
  loading:       document.getElementById("loading-screen"),
  channels:      document.getElementById("channels-screen"),
  channelDetail: document.getElementById("channel-detail-screen"),
  player:        document.getElementById("player-screen"),
  timesup:       document.getElementById("timesup-screen"),
  error:         document.getElementById("error-screen"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function showError(message) {
  document.getElementById("error-message").textContent = message;
  showScreen("error");
}

// ── Google Auth ──
function handleAuthResponse(response) {
  if (response.error) {
    clearStoredToken();
    showScreen("login");
    return;
  }
  accessToken = response.access_token;
  storeToken(response.access_token);
  loadSubscriptions();
}

function initGoogleAuth() {
  if (!window.google || !window.google.accounts) {
    setTimeout(initGoogleAuth, 100);
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    callback: handleAuthResponse,
  });
  const stored = getStoredToken();
  if (stored) {
    accessToken = stored;
    loadSubscriptions();
    return;
  }
  showScreen("login");
}

function startLogin() {
  if (!tokenClient) {
    showError("Login is still loading. Please wait a moment and try again.");
    return;
  }
  tokenClient.requestAccessToken({ prompt: "select_account" });
}

// ── Global timer ──
function startGlobalTimer() {
  const remaining = getRemainingSeconds();

  if (remaining === null) {
    // Fresh session — start a new timer
    saveTimerStart(CONFIG.WATCH_TIMER_SECONDS);
    runTimer(CONFIG.WATCH_TIMER_SECONDS);
  } else if (remaining === 0) {
    // Already expired (e.g. they refreshed after time was up)
    clearTimerStorage();
    timeIsUp();
    return;
  } else {
    // Resume from where we left off
    runTimer(remaining);
  }

  document.getElementById("global-timer").classList.remove("hidden");
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
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const text = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  document.getElementById("global-timer-display").textContent  = text;
  document.getElementById("player-timer-display").textContent  = text;
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

function openResetModal(origin = "header") {
  resetModalOrigin = origin;
  selectedMinutes = Math.round(CONFIG.WATCH_TIMER_SECONDS / 60);
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.minutes) === selectedMinutes);
  });
  document.getElementById("parent-reset-input").value = "";
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
    resetTimer(selectedMinutes * 60);
    if (resetModalOrigin === "timesup") {
      history.replaceState({ screen: "channels" }, "");
      showScreen("channels");
    }
  } else {
    document.getElementById("parent-reset-error").classList.remove("hidden");
    document.getElementById("parent-reset-input").value = "";
    document.getElementById("parent-reset-input").focus();
  }
}

// ── Subscriptions ──
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

    renderChannels(subscriptions);
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
      card.innerHTML = `
        <img class="channel-thumb" src="${thumb}" alt="${title}">
        <div class="channel-name">${title}</div>
      `;
      card.addEventListener("click", () => openChannel(channelId, title));
      grid.appendChild(card);
    });
  }
  history.replaceState({ screen: "channels" }, "");
  showScreen("channels");
}

// ── Channel detail ──
async function openChannel(channelId, title) {
  currentChannelId    = channelId;
  currentChannelTitle = title;
  currentSort         = "new";
  uploadsPlaylistId   = null;
  nextPageToken       = null;

  document.getElementById("channel-detail-title").textContent = title;
  document.getElementById("sort-new").classList.add("active");
  document.getElementById("sort-popular").classList.remove("active");
  document.getElementById("videos-grid").innerHTML = "";
  document.getElementById("load-more-container").classList.add("hidden");

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

// Parent reset — header lock, player lock, tap illustration on time's up
document.getElementById("parent-reset-btn").addEventListener("click", () => openResetModal("header"));
document.getElementById("player-reset-btn").addEventListener("click", () => openResetModal("header"));
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

// Allow pressing Enter in the code input
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

initGoogleAuth();
