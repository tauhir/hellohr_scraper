/*
Start recording when user clicks button
Reload page and start scraping

*/

// Date 2022/08/08
// Nothing here for now, popup can later set region
const companies = "companies"
const employees = "employees"
const payroll = "payroll"
const payrollURL = "https://app.hellohr.co.za/payroll"
const employeesURL = "https://app.hellohr.co.za/companies"
const companiesURL = "https://app.hellohr.co.za/" 

var length;
document.addEventListener('DOMContentLoaded', function() {
    console.log("Scraping now")
    var link = document.getElementById('button')
    // onClick's logic below:
    link.addEventListener('click', function() {
        mainFn();
    });
});

function mainFn() {
    //do a page reload, then start scraping
    //check if active tab is https://app.hellohr.co.za/
    if (active != companiesURL){
        alert("please ensure that you're on helloHR and logged in");
        break;
    }
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
          length = Number(request.action.split(":")[1])
        });
    });
    for (let index = 0; index < length; index++) {
    // we're going to iterate through each company with the various actions that the page needs to perform to get the data
        
        //first we change context
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "change context to company:"+index}, function(response) {
            console.log(response.action);
            });
            
        });
        //now we redirect to employees page and send query to start scraping for that company
        chrome.tabs.update({url: employeesURL});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "start processing company and employees for:"+index}, function(response) {
            console.log(response.action);
            });
            
        });

        //now we redirect to payroll page and start scraping the payroll history
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "change context to company:"+index}, function(response) {
            console.log(response.action);
            });
            
        });

    }


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










