function setCustomNativeBridgeName(name) {
  window.cordova_iab_customName = name;
}

function callNative(message) {
  if (window.cordova_iab_customName && window.webkit.messageHandlers[cordova_iab_customName]) {
    window.webkit.messageHandlers[cordova_iab_customName].postMessage(message);
  }
}

function setHeaderInfo(headers) {
  if (typeof headers === 'object') {
    window.customHeaders = headers;
  } else {
    window.customHeaders = { 'X-HAPPY-MOBILE': 1 };
  }
}

function setSerializedHeaders(headerString) {
  let headerObject = {};
  const headerStrings = headerString.split(',');
  headerStrings.forEach((serializedPair) => {
    const pair = serializedPair.split('=');
    headerObject[pair[0]] = pair[1];
  });
  setHeaderInfo(headerObject)
}

function setJSONHeaders(jsonHeaders) {
  try {
    setHeaderInfo(JSON.parse(jsonHeaders));
  } catch (error) {
    setHeaderInfo();
  }
}

function getHeaderInfo() {
  return window.customHeaders || { 'X-HAPPY-MOBILE': 1 };
}

function overrideXHR() {
  if (!XMLHttpRequest.prototype.originalSend) {
    XMLHttpRequest.prototype.originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function send(body) {
      try {
        let headers = getHeaderInfo();
        for (let name in headers) {
          this.setRequestHeader(name, headers[name]);
        }
      } catch (error) { }
      this.originalSend(body);
    };
  }
}

function SessionRefresher(timeInterval) {
  this.timer = null;
  this.timeInterval = timeInterval || 600000;
  return this;
}

SessionRefresher.prototype.refresh = function refresh() {
  let xhr = new XMLHttpRequest;
  xhr.open('GET', window.location.origin);
  xhr.onreadystatechange = function () {
    if (xhr.status === 200) {
      xhr.onreadystatechange = null;
      xhr = null;
    }
  }
  xhr.send();
}

SessionRefresher.prototype.start = function start() {
  if (window.location.protocol.startsWith('http')) {
    this.refresh();
    this.timer = setInterval(this.refresh, this.timeInterval);
    return true;
  }
}

SessionRefresher.prototype.stop = function stop() {
  clearInterval(this.timer);
  return true;
}

callNative('reuestHeaders');

overrideXHR();

if (window.refresher) {
  window.refresher.stop();
} else {
  window.refresher = new SessionRefresher;
}
window.refresher.start();
