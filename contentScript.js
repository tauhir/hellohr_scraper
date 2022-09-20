/*
start at homepage, determine number of companies and send that to extension (wait for message)
start processing each company:
select company on homepage to get context
go to people page
get company data  https://app.hellohr.co.za/elasticsearch/search
get employee data https://app.hellohr.co.za/elasticsearch/msearch
go to payroll page
get payroll data 
*/
const payrollURL = "https://app.hellohr.co.za/payroll"
const employeesURL = "https://app.hellohr.co.za/companies"
const companiesURL = "https://app.hellohr.co.za/" 
function interceptData() {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('script.js');
    s.onload = function() {
        this.remove();
    };

    document.head.prepend(s);
  }

function checkForDOM() {
if (document.body && document.head) {
    interceptData();
} else {
    requestIdleCallback(checkForDOM);
}
}
requestIdleCallback(checkForDOM);




chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.action === "start scraping") {
        sendResponse({action: "scraping started"});
        mainFn();
    } else if (request.action.contains("start processing company")) {
        //change context to that company, click employee page for the company
        var length = Number(request.action.split(":")[1])
        employeesFn(length);
    }
});


  function mainFn() {
    
    //location.reload();
    console.log("scraping companies now")
    const intervalID = setInterval(scrapeData("companies"), 1500);

}
  function employeesFn(company){
  // check the companylog and iterate through each company to see if employee data is empty
  // if so, select the company in the dropdown
  // navigate to employees page
    var companyList = document.getElementsByClassName("bubble-element RepeatingGroup")[0].getElementsByClassName("bubble-element Group clickable-element");
    companyList[company].click();
    location.href = 'https://app.hellohr.co.za/companies';
  }

  function scrapeData(context) {
    var responseContainingEle = document.getElementsByClassName('__interceptedData');
    if (responseContainingEle) {
        for (let i = 0; i < responseContainingEle.length; i++) {
            logger(responseContainingEle[i],context)
            }

    } else {
        scrapeData;
    }
}

  function logger(element,context) {
    // format of element.innerHTML is now [url,responseData]
    switch(context) {
      case 'companies':
        chrome.storage.local.get({logData: []}, function (result) {
          var dataReturn = getData(result.logData, element.innerHTML, context);
          console.log(dataReturn)
          // currently unnecessarily saving the log even when there are no changes
          if (dataReturn[0] === true) {
              chrome.storage.local.set({logData: dataReturn[1]}, function () {
                  // you can use strings instead of objects
                  // if you don't  want to define default values
                  chrome.storage.local.get('logData', function (result) {
                      console.log("this is the current company array:")
                      console.log(result.logData)
                  });
              })
              element.remove(); //after processing element, delete it to ensure we don't do doublework 
              //chrome.runtime.sendMessage({action: "completed companies:"+result.logData.length}, function(response) {
              scrapeData('employees');
          }});
          break;
      case "employees":
        console.log("employees")
        chrome.storage.local.get({logData: []}, function (result) {
          var dataReturn = getData(result.logData, element.innerHTML, context);
          console.log(dataReturn)
          // currently unnecessarily saving the log even when there are no changes
          if (dataReturn[0] === true) {
              chrome.storage.local.set({logData: dataReturn[1]}, function () {
                  // you can use strings instead of objects
                  // if you don't  want to define default values
                  chrome.storage.local.get('logData', function (result) {
                      console.log("this is the current company array:")
                      console.log(result.logData)
                  });
              })
              element.remove(); //after processing element, delete it to ensure we don't do doublework 
              //chrome.runtime.sendMessage({action: "completed companies:"+result.logData.length}, function(response) {
              scrapeData('employees');  
            }});
        break;
      default:
        console.log("how");
  }}
    


function getData(companyArray, responseData, context) {
    // here we handle the response data with the various contexts we get them in
    var parsed = false;
    var companies = companyArray;
    url = responseData.split(',')[0]
    responseData = JSON.parse(responseData.replace(url+",",''));
    
    switch(context) {
        case 'companies':
          //issue is that we need to know what company we're working in
          // we also need to iterate through the rest of the companies
          if (companies.length === 0) {
            var html_company_list = document.getElementsByClassName("bubble-element Dropdown dropdown-chevron")[0].options;
            var companyList = [];
            for (let index = 1; index < html_company_list.length; index++) {
              companies[index-1] =  {
                "company_name": html_company_list[index].innerHTML,
                "company_info": {},
                "employees": [{
                  "employeeInfo": {},
                  "payrollData": {}
                  }]
                }           
            }
          }


          if (url === "https://app.hellohr.co.za/elasticsearch/search") {
            console.log(responseData);
          }
          if ((url === "https://app.hellohr.co.za/elasticsearch/search") && !(responseData.hits.hits[0]._source.sdl_exempt_boolean === undefined) ){ //sdl_exempt is first attrib
            for (let i = 0; i < companies.length; i++) {
              if (companies[i].company_name === responseData.hits.hits[i]._source.company1_custom_company) {
                companies[i].company_info = responseData.hits.hits[i]._source;
              }
            }
            parsed = true;
          }
          break;
        case "employees":
          //get company from dropdown:
          var companyList = document.getElementsByClassName("bubble-element Dropdown dropdown-chevron")[0];
          var companyName = companyList.options[companyList.selectedIndex].text;
          if (url === "https://app.hellohr.co.za/elasticsearch/msearch") {
            console.log(responseData);
          }

          if ((url === "https://app.hellohr.co.za/elasticsearch/msearch") && !(responseData.responses[0].hits.hits[0]._source.medical_aid_number_number === undefined) ){ //sdl_exempt is first attrib
            var total_employees = responseData.responses[0].hits.total;  

            for (let i = 0; i <= companies.length; i++) {
              if (companies[i].company_name === companyName) {
                for (let j = 0; j<total_employees; j++) {
                  companies[i].employees.push({
                    employeeInfo: responseData.responses[0].hits.hits[j]._source,
                    payrollData: {}
                  })
                }

              }
            }
            parsed = true;
          }
          break;
        default:
          // code block
      }
    return [parsed,companies]; 
}
//const intervalID = setInterval(scrapeData, 2000);