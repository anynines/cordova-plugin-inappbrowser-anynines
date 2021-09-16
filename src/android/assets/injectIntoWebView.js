XMLHttpRequest.prototype.originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function send(body) {
  try {
    const jsonHeaders = cordova_iab.getHeaders();
    let headers = JSON.parse(jsonHeaders);
    for (let name in headers) {
      this.setRequestHeader(name, headers[name]);
    }
    this.originalSend(body);
  } catch (error) { }
};

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

const refresher = new SessionRefresher;
refresher.start();