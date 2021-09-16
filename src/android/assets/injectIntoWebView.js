console.log('INJECTING SCRIPT');
XMLHttpRequest.prototype.originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function send(body) {
  try {
    const jsonHeaders = cordova_iab.getHeaders();
    alert(jsonHeaders.toString());
    let headers = JSON.parse(jsonHeaders);
    for (let name in headers) {
      this.setRequestHeader(name, headers[name]);
      alert(name + ': ' + headers[name]);
    }
    alert('Body: '.concat(body) || 'Request has no body');
    this.originalSend(body);
  } catch(error) {
    alert('headers could not be set: ' + Error.toString())
  }
};

function SessionRefresher(timeInterval) {
  this.timer = null;
  this.timeInterval = timeInterval || 600000;
  return this;
}

SessionRefresher.prototype.refresh = function refresh() {
  let xhr = new XMLHttpRequest;
  xhr.open('GET', window.location.origin);
  xhr.onreadystatechange = function() {
    if (xhr.status === 200) {
      alert('refresh successful');
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