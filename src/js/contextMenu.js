const createMenus = () => {
    chrome.contextMenus.create({
        "type": "normal",
        "title": "Reset Wallet",
        "documentUrlPatterns": [`chrome-extension://${chrome.runtime.id}/app.html`],
        "onclick": (_info, tab) => {
	        chrome.tabs.sendMessage(tab.id, {type: 'resetWallet'});
        }
    });
}

export default createMenus