let websiteUrl;
let websiteHostName;

function showError(text) {
  const div = document.createElement("div");
  div.setAttribute("id", "error-container");
  div.innerHTML = `
    <div class="error">
      <p>${text}</p>     
    </div>
  `;
  document.querySelector(".bottom-item").appendChild(div);

  setTimeout(() => {
    document.getElementById("error-container").remove();
  }, 3000);
}

function handleBlockedUrls(data) {
  const blockedUrls = data.BlockedUrls || [];

  if (blockedUrls.some((e) => e.url === websiteHostName && e.status === "In_Progress")) {
    showError("This URL will be completely blocked after some time");
  } else if (blockedUrls.some((e) => e.url === websiteHostName && e.status === "BLOCKED")) {
    showError("This URL is blocked completely");
  } else {
    chrome.storage.local.set({
      BlockedUrls: [...blockedUrls, { status: "In_Progress", url: websiteHostName }],
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { from: "popup", subject: "startTimer" });
    });

    setTimeout(() => {
      chrome.storage.local.get("BlockedUrls", (data) => {
        const updatedBlockedUrls = data.BlockedUrls.map((e) => {
          if (e.url === websiteHostName && e.status === "In_Progress") {
            const then = new Date();
            then.setHours(1, 0, 0, 0);
            const blockTill = then.getTime();
            return { ...e, status: "BLOCKED", BlockTill: blockTill };
          }
          return e;
        });
        chrome.storage.local.set({ BlockedUrls: updatedBlockedUrls });
      });
    }, 5000);
  }
}

function handleButtonClick() {
  if (websiteUrl.toLowerCase().includes("chrome://")) {
    showError("You cannot block a Chrome URL");
  } else {
    chrome.storage.local.get("BlockedUrls", handleBlockedUrls);
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  websiteUrl = tabs[0].url;
  websiteHostName = new URL(tabs[0].url).hostname;
  document.getElementById("url").innerText = websiteHostName;
});

document.getElementById("btn").addEventListener("click", handleButtonClick);
