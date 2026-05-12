// CalmTube main app logic
// Handles Google login, fetching subscriptions, and rendering the channel grid.

const screens = {
  login: document.getElementById("login-screen"),
  loading: document.getElementById("loading-screen"),
  channels: document.getElementById("channels-screen"),
  error: document.getElementById("error-screen"),
};

const channelsGrid = document.getElementById("channels-grid");
const errorMessage = document.getElementById("error-message");
const loginButton = document.getElementById("login-button");
const retryButton = document.getElementById("retry-button");

let accessToken = null;
let tokenClient = null;

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  showScreen("error");
}

// Initializes the Google Identity Services token client.
// We request the readonly YouTube scope so we can read subscriptions and channel data.
function initGoogleAuth() {
  if (!window.google || !window.google.accounts) {
    setTimeout(initGoogleAuth, 100);
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    callback: (response) => {
      if (response.error) {
        showError("Login failed. Please try again.");
        return;
      }
      accessToken = response.access_token;
      loadSubscriptions();
    },
  });
}

function startLogin() {
  if (!tokenClient) {
    showError("Login is still loading. Please wait a moment and try again.");
    return;
  }
  tokenClient.requestAccessToken();
}

// Calls the YouTube Data API to fetch all of the user's subscriptions.
// The API returns 50 per page, so we loop until there are no more pages.
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

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      subscriptions.push(...data.items);
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    renderChannels(subscriptions);
  } catch (err) {
    console.error(err);
    showError("Could not load channels. Please try again.");
  }
}

function renderChannels(subscriptions) {
  channelsGrid.innerHTML = "";

  if (subscriptions.length === 0) {
    channelsGrid.innerHTML =
      '<p style="text-align:center; grid-column: 1 / -1; color:#6b7280;">No subscribed channels found.</p>';
  } else {
    subscriptions.forEach((sub) => {
      const channelId = sub.snippet.resourceId.channelId;
      const title = sub.snippet.title;
      const thumb = sub.snippet.thumbnails.medium.url;

      const card = document.createElement("div");
      card.className = "channel-card";
      card.dataset.channelId = channelId;
      card.innerHTML = `
        <img class="channel-thumb" src="${thumb}" alt="${title}">
        <div class="channel-name">${title}</div>
      `;
      card.addEventListener("click", () => openChannel(channelId, title));
      channelsGrid.appendChild(card);
    });
  }

  showScreen("channels");
}

// Placeholder. We'll build this in the next slice.
function openChannel(channelId, title) {
  alert(`Coming soon: latest videos from "${title}"`);
}

loginButton.addEventListener("click", startLogin);
retryButton.addEventListener("click", () => showScreen("login"));

initGoogleAuth();
