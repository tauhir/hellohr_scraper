console.log("script works");

var XHR = XMLHttpRequest.prototype;
var send = XHR.send;
var open = XHR.open;
XHR.open = function(method, url) {
    this.url = url; // the request url
    return open.apply(this, arguments);
}
XHR.send = function() {
    this.addEventListener('load', function() {
        if (this.url.includes('app.hellohr')) {
            var dataDOMElement = document.createElement('div');
            dataDOMElement.id = '__interceptedData';
            dataDOMElement.classList.add('__interceptedData');
            var array = [];
            array.push(this.url); //we want both the url and the response so we can filter out bad stuff later
            array.push(this.response)
            dataDOMElement.innerText = array;
            dataDOMElement.style.height = 0;
            dataDOMElement.style.overflow = 'hidden';
            document.body.appendChild(dataDOMElement);
            console.log("new ajax request");
        }               
    });
    return send.apply(this, arguments);
};