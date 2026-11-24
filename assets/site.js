(function() {
  // Select a localized App Store product URL from the browser's regional locale.
  // Apple does not expose the signed-in Apple Account storefront to a website;
  // unsupported locales use the US product page as a stable fallback.
  var appStoreUrls = {
    CN: "https://apps.apple.com/cn/app/sview-%E5%9B%BE%E7%89%87%E6%8E%92%E7%89%88-%E8%B7%A8%E5%B1%8F%E6%8B%BC%E6%8E%A5/id6759950270",
    US: "https://apps.apple.com/us/app/sview-swipe-carousel-maker/id6759950270",
    GB: "https://apps.apple.com/gb/app/sview-swipe-carousel-maker/id6759950270",
    DE: "https://apps.apple.com/de/app/sview-swipe-carousel-maker/id6759950270",
    JP: "https://apps.apple.com/jp/app/sview-%E5%86%99%E7%9C%9F%E3%82%B3%E3%83%A9%E3%83%BC%E3%82%B8%E3%83%A5-%E3%82%AB%E3%83%AB%E3%83%BC%E3%82%BB%E3%83%AB/id6759950270",
    KR: "https://apps.apple.com/kr/app/sview-%EC%82%AC%EC%A7%84-%EC%BD%9C%EB%9D%BC%EC%A3%BC-%EC%BA%90%EB%9F%AC%EC%85%80/id6759950270",
    HK: "https://apps.apple.com/hk/app/sview-%E5%9C%96%E7%89%87%E6%8E%92%E7%89%88-%E8%B7%A8%E5%B1%8F%E6%8B%BC%E6%8E%A5/id6759950270",
    TW: "https://apps.apple.com/tw/app/sview-%E5%9C%96%E7%89%87%E6%8E%92%E7%89%88-%E8%B7%A8%E5%B1%8F%E6%8B%BC%E6%8E%A5/id6759950270"
  };
  var localeList = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
  var storeUrl = appStoreUrls.US;
  for (var i = 0; i < localeList.length; i++) {
    var locale = localeList[i];
    var region = "";
    try { region = new Intl.Locale(locale).region || ""; } catch (e) {}
    if (!region && /^zh-(CN|TW|HK|MO)$/i.test(locale)) region = locale.slice(-2).toUpperCase();
    if (region === "MO") region = "HK";
    if (appStoreUrls[region]) { storeUrl = appStoreUrls[region]; break; }
  }
  document.querySelectorAll("[data-store-download]").forEach(function(el) {
    el.href = storeUrl;
  });

  // Theme toggle: flips the effective theme; choosing the same as the device setting returns to auto.
  var themeBtn = document.getElementById('themeBtn');
  var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
  function systemTheme() { return darkMQ && darkMQ.matches ? 'dark' : 'light'; }
  function effectiveTheme() { return document.documentElement.getAttribute('data-theme') || systemTheme(); }
  function syncThemeUI() {
    var t = effectiveTheme();
    themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    var c = t === 'dark' ? '#111110' : '#fafaf8';
    themeColorMetas.forEach(function(m) { m.setAttribute('content', c); });
  }
  themeBtn.addEventListener('click', function() {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    if (next === systemTheme()) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.removeItem('sview-theme'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('sview-theme', next); } catch (e) {}
    }
    syncThemeUI();
  });
  if (darkMQ) {
    var onSystemChange = function() { syncThemeUI(); };
    if (darkMQ.addEventListener) darkMQ.addEventListener('change', onSystemChange);
    else if (darkMQ.addListener) darkMQ.addListener(onSystemChange);
  }
  syncThemeUI();

  // Nav scroll
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

})();
