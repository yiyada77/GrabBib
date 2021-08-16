// function copyBibTex() {
//     let url = window.location.href
//     if (url.indexOf('pdf') > -1) {
//         url = url.replace('file', 'hash')
//         url = url.replace('Paper.pdf', 'Abstract.html')
//         console.log(url)
//         chrome.tabs.create({ url: url });
//     }
// }

// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: copyBibTex
//     });
// });

