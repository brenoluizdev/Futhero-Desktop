//Thanks random stranger on github @serhiisol !
//https://gist.github.com/serhiisol/122263506ed923815ae66db9178c17d0


// Pretend that cookies work
(function (document, ls) {
    var cookies = {};
    document.__defineGetter__('cookie', function () {
      var output = [];
      for (var cookieName in ls) {
        output.push(cookieName + "=" + ls.getItem(cookieName));
      }
      return output.join(";");
    });
    document.__defineSetter__('cookie', function (s) {
      var indexOfSeparator = s.indexOf("=");
      var key = s.substr(0, indexOfSeparator);
      var value = s.substring(indexOfSeparator + 1);
  
      ls.setItem(key, value);
      return key + "=" + value;
    });
    document.clearCookies = function () {
  
    };
    
  })(document, localStorage);