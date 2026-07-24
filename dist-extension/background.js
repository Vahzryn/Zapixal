chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-zapixal",
    title: "Convert & Compress with Zapixal",
    contexts: ["image"]
  });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-zapixal" && info.srcUrl) {
    const encodedUrl = encodeURIComponent(info.srcUrl);
    chrome.tabs.create({
      url: `https://zapixal.com?src=${encodedUrl}`
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-zapixal-paste") {
    chrome.tabs.create({
      url: 'https://zapixal.com?action=paste'
    });
  }
});