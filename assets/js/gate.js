/* ==========================================================================
   Page d'attente « arrive bientôt » protégée par mot de passe.
   Chargée en tout premier dans le <head> de chaque page.

   - Pour CHANGER le mot de passe : remplacer HASH par l'empreinte SHA-256
     du nouveau mot de passe (terminal : printf %s 'motdepasse' | sha256sum).
     Les visiteurs déjà entrés devront saisir le nouveau.
   - Pour LANCER officiellement le site : passer ENABLED à false
     (ou retirer la ligne <script src="assets/js/gate.js"> des pages).

   Note : c'est une protection côté navigateur, suffisante pour une
   pré-ouverture, mais le contenu reste techniquement lisible dans le code
   source. Ne pas y mettre d'informations confidentielles.
   ========================================================================== */
(function () {
  var CONFIG = {
    ENABLED: true,
    HASH: "eb6d5d7048fb4d0b6fc263e1d69ff680fae7b9a30fb774515f765ee804147154",
    KEY: "ancreal-gate-v2",
    name: "Ancréal",
    logo: '<svg viewBox="320 318 510 450" aria-hidden="true"><polygon points="330,757 648,328 716,418 464,757"/><polygon points="612,590 681,632 681,757 612,757"/><polygon points="705,483 820,573 820,757 705,757"/></svg><span class="g-word">ANCRÉAL</span>',
    tagline: "Un toit, une seconde chance.",
    text: "Entreprise de l'Économie Sociale et Solidaire, Ancréal acquiert, rénove et loue des logements pour les personnes en réinsertion dans le Grand Est. Notre site ouvre très prochainement.",
    contact: "contact@groupecohesif.com",
    colors: { bg: "#f2efe9", ink: "#15191e", text: "#3b424a", muted: "#6a727b", line: "#d8d3cb", brand: "#1b3a5b", brandDark: "#10263d", accent: "#a8432d", error: "#a8432d" },
    fonts: { head: '"Archivo", "Helvetica Neue", Arial, sans-serif', headWeight: 800, body: '"Public Sans", "Helvetica Neue", Arial, sans-serif', brand: '"Montserrat", "Helvetica Neue", Arial, sans-serif' },
    radius: "2px"
  };

  if (!CONFIG.ENABLED) return;
  var root = document.documentElement;
  try { if (localStorage.getItem(CONFIG.KEY) === CONFIG.HASH) return; } catch (e) {}
  try { if (sessionStorage.getItem(CONFIG.KEY) === CONFIG.HASH) return; } catch (e) {}

  /* --- SHA-256 (synchrone, sans dépendance) --- */
  function sha256(str) {
    var K = [], H = [], p = 2, n = 0;
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    outer: while (n < 64) {
      for (var f = 2; f * f <= p; f++) if (p % f === 0) { p++; continue outer; }
      if (n < 8) H[n] = frac(Math.pow(p, 1 / 2));
      K[n++] = frac(Math.pow(p, 1 / 3)); p++;
    }
    var bytes = unescape(encodeURIComponent(str)), words = [], l = bytes.length * 8, i, j;
    for (i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    words[l >> 5] |= 0x80 << (24 - l % 32);
    words[(((l + 64) >> 9) << 4) + 15] = l;
    function r(x, s) { return (x >>> s) | (x << (32 - s)); }
    for (i = 0; i < words.length; i += 16) {
      var w = [], h = H.slice(0);
      for (j = 0; j < 16; j++) w[j] = words[i + j] | 0;
      for (j = 0; j < 64; j++) {
        if (j >= 16) {
          var a = w[j - 15], b = w[j - 2];
          w[j] = (w[j - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[j - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) | 0;
        }
        var t1 = h[7] + (r(h[4], 6) ^ r(h[4], 11) ^ r(h[4], 25)) + ((h[4] & h[5]) ^ (~h[4] & h[6])) + K[j] + (w[j] | 0);
        var t2 = (r(h[0], 2) ^ r(h[0], 13) ^ r(h[0], 22)) + ((h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2]));
        h = [(t1 + t2) | 0].concat(h); h[4] = (h[4] + t1) | 0; h.pop();
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + h[j]) | 0;
    }
    var out = "";
    for (i = 0; i < 8; i++) out += ("00000000" + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  /* --- Masquage immédiat du site (avant tout affichage) --- */
  var c = CONFIG.colors, f = CONFIG.fonts;
  var css =
    "html.site-gated{background:" + c.bg + "}" +
    "html.site-gated body{overflow:hidden!important}" +
    "html.site-gated body>*:not(#site-gate){visibility:hidden!important}" +
    "#site-gate{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;background:" + c.bg + ";color:" + c.text + ";font-family:" + f.body + ";" +
      "-webkit-font-smoothing:antialiased;transition:opacity .5s ease,visibility .5s ease}" +
    "#site-gate.is-open{opacity:0;visibility:hidden}" +
    "#site-gate .g-wrap{min-height:100%;max-width:1200px;margin:0 auto;padding:0 clamp(16px,5vw,64px);display:flex;flex-direction:column}" +
    "#site-gate .g-top,#site-gate .g-bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}" +
    "#site-gate .g-top{padding:28px 0}" +
    "#site-gate .g-logo{display:flex;align-items:center;gap:12px;color:" + c.ink + "}" +
    "#site-gate .g-logo svg{height:34px;width:auto;fill:" + c.brand + "}" +
    "#site-gate .g-logo img{height:52px;width:auto}" +
    "#site-gate .g-word{font-family:" + f.brand + ";font-weight:500;font-size:19px;letter-spacing:.22em;color:" + c.brand + "}" +
    "#site-gate .g-status{font-size:14px;color:" + c.muted + "}" +
    "#site-gate .g-main{flex:1;display:flex;flex-direction:column;justify-content:center;padding:48px 0 64px;max-width:680px}" +
    "#site-gate .g-title{font-family:" + f.head + ";font-weight:" + f.headWeight + ";color:" + c.ink + ";font-size:clamp(38px,6.5vw,68px);line-height:1.04;letter-spacing:-.025em;margin:0 0 24px}" +
    "#site-gate .g-tag{font-family:" + f.head + ";font-weight:600;color:" + c.brand + ";font-size:clamp(18px,2.4vw,21px);margin:0 0 12px}" +
    "#site-gate .g-text{font-size:17px;line-height:1.65;margin:0 0 44px;max-width:560px}" +
    "#site-gate .g-label{display:block;font-size:14px;font-weight:600;color:" + c.ink + ";margin:0 0 10px}" +
    "#site-gate form{display:flex;gap:8px;max-width:440px}" +
    "#site-gate input{flex:1;min-width:0;height:50px;padding:0 16px;font:inherit;font-size:16px;color:" + c.ink + ";background:#fff;" +
      "border:1px solid " + c.line + ";border-radius:" + CONFIG.radius + ";outline:none;transition:border-color .2s}" +
    "#site-gate input:focus{border-color:" + c.brand + "}" +
    "#site-gate button{height:50px;padding:0 26px;font:inherit;font-weight:600;font-size:15px;color:#fff;background:" + c.brand + ";border:0;" +
      "border-radius:" + CONFIG.radius + ";cursor:pointer;transition:background .2s}" +
    "#site-gate button:hover{background:" + c.brandDark + "}" +
    "#site-gate button:focus-visible,#site-gate input:focus-visible{outline:2px solid " + c.accent + ";outline-offset:2px}" +
    "#site-gate .g-error{min-height:22px;margin:10px 0 0;font-size:14px;color:" + c.error + "}" +
    "#site-gate .g-bottom{border-top:1px solid " + c.line + ";padding:22px 0 28px;font-size:14px;color:" + c.muted + "}" +
    "#site-gate .g-bottom a{color:" + c.ink + ";text-decoration:none;border-bottom:1px solid " + c.line + "}" +
    "#site-gate .g-bottom a:hover{border-color:" + c.ink + "}" +
    "@media (max-width:520px){#site-gate form{flex-direction:column}#site-gate input{flex:none;width:100%}#site-gate button{width:100%}" +
      "#site-gate .g-logo img{height:44px}#site-gate .g-main{padding:32px 0 48px}}" +
    "@media (prefers-reduced-motion:reduce){#site-gate{transition:none}}";

  root.classList.add("site-gated");
  var style = document.createElement("style");
  style.id = "site-gate-style";
  style.textContent = css;
  document.head.appendChild(style);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }

  function mount() {
    var gate = document.createElement("div");
    gate.id = "site-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "site-gate-title");
    gate.innerHTML =
      '<div class="g-wrap">' +
        '<header class="g-top"><div class="g-logo">' + CONFIG.logo + '</div><span class="g-status">Site en pré-ouverture</span></header>' +
        '<main class="g-main">' +
          '<h1 class="g-title" id="site-gate-title">' + esc(CONFIG.name) + " arrive bientôt.</h1>" +
          '<p class="g-tag">' + esc(CONFIG.tagline) + "</p>" +
          '<p class="g-text">' + esc(CONFIG.text) + "</p>" +
          '<label class="g-label" for="site-gate-pw">Accès réservé</label>' +
          '<form novalidate>' +
            '<input id="site-gate-pw" type="password" autocomplete="current-password" placeholder="Mot de passe" required>' +
            '<button type="submit">Entrer</button>' +
          "</form>" +
          '<p class="g-error" role="alert" aria-live="polite"></p>' +
        "</main>" +
        '<footer class="g-bottom"><span>' +
          (CONFIG.contact ? 'Une question : <a href="mailto:' + esc(CONFIG.contact) + '">' + esc(CONFIG.contact) + "</a>" : "") +
          "</span><span>© " + new Date().getFullYear() + " " + esc(CONFIG.name) + "</span></footer>" +
      "</div>";
    document.body.appendChild(gate);

    var form = gate.querySelector("form"), input = gate.querySelector("input"), error = gate.querySelector(".g-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sha256(input.value.trim()) === CONFIG.HASH) {
        try { localStorage.setItem(CONFIG.KEY, CONFIG.HASH); } catch (err) {}
        try { sessionStorage.setItem(CONFIG.KEY, CONFIG.HASH); } catch (err) {}
        root.classList.remove("site-gated");
        gate.classList.add("is-open");
        setTimeout(function () { gate.remove(); style.remove(); }, 600);
      } else {
        error.textContent = "Mot de passe incorrect.";
        input.select();
      }
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
