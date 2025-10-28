function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Check if URI ends with /
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  }
  // Check if URI has no extension
  else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }
  
  return request;
}
