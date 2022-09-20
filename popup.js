/*
Start recording when user clicks button
Reload page and start scraping

*/

// Date 2022/08/08
// Nothing here for now, popup can later set region
const companies = "companies"
const employees = "employees"
document.addEventListener('DOMContentLoaded', function() {
    console.log("Scraping now1")
    var link = document.getElementById('button')
    // onClick's logic below:
    link.addEventListener('click', function() {
        mainFn();
    });
});

function mainFn() {
    //do a page reload, then start scraping
    chrome.storage.local.set({logData: []}, function () {
        // you can use strings instead of objects
        // if you don't  want to define default values
        chrome.storage.local.get('logData', function (result) {
            console.log("this is the current company array (blank expected):")
            console.log(result.logData)
        });
    })
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "start scraping"}, function(response) {
          console.log(response.action);
        });
      });
    chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.action.includes("completed companies")){
            //wait for page reload then send message to start employees
            //iterate through companies
            var length = Number(request.action.split(":")[1])
            for (let i = 0; i < length; index++) {
                sendResponse({action: "start processing company:"+length});
                
            }
            
        }

    }
    );
}










