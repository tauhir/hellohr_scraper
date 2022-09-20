//Author: Tauhir Edwards
// Date 2022/08/08
// Creates a listener to add a context menu item, then opens a new tab searching for the hightlighted text

// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        title: "Search on Support Dashboard",
        type: 'normal',
        id: 'search_command',
        contexts: ['selection'],
    });
  });
  
// opens new tab and searched for selected text  
chrome.contextMenus.onClicked.addListener((item, tab) => {
let url = new URL(`https://simplepay.co.za/support_admin/dashboard/search?utf8=%E2%9C%93&commit=Search`)
url.searchParams.set('q', item.selectionText)
chrome.tabs.create({ url: url.href, index: tab.index + 1 });
});
