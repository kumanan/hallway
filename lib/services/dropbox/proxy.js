var querystring = require('querystring');
var request = require('request');

exports.proxy = function(auth, req, res)
{
  req.oauth = {consumer_key:auth.consumerKey, consumer_secret:auth.consumerSecret, token:auth.token, token_secret:auth.tokenSecret};
  var api = (req.url.indexOf("/files") == 0 || req.url.indexOf('/thumbnails') == 0) ? "api-content" : "api";
  req.url = 'https://'+api+'.dropbox.com/1'+req.url.split("/").map(encodeURIComponent).join('/');
  // modify things to match request's model
  if(req.method == 'GET') delete req.body;
  if(req.query && Object.keys(req.query).length > 0) req.url += '?' + querystring.stringify(req.query);
  delete req.headers.host;
  return request(req).pipe(res);
}