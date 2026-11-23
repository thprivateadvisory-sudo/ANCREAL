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
    HASH: "43266a29e4419f0b394e3ecdc84dcdbe477d6b4729c4c7f3e5ff12e8ab4cd5fe",
    KEY: "ancreal-gate",
    name: "Ancréal",
    logo: "assets/img/logo-mark-white.svg",
    eyebrow: "Entreprise de l'Économie Sociale et Solidaire · Grand Est",
    tagline: "Un toit, une seconde chance.",
    text: "Nous préparons le lancement officiel de notre site. Logement solidaire, réhabilitation et réinsertion : rendez-vous très bientôt.",
    contact: "contact@groupecohesif.com",
    colors: { bg: "#10263d", bg2: "#1b3a5b", accent: "#a8432d", accentHover: "#8c3523", text: "#c5d1de" },
    fonts: { head: '"Archivo", "Helvetica Neue", Arial, sans-serif', body: '"Public Sans", "Helvetica Neue", Arial, sans-serif' },
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
  var c = CONFIG.colors;
  var css =
    "html.site-gated{background:" + c.bg + "}" +
    "html.site-gated body{overflow:hidden!important}" +
    "html.site-gated body>*:not(#site-gate){visibility:hidden!important}" +
    "#site-gate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:32px 16px;overflow-y:auto;" +
      "background:radial-gradient(120% 80% at 50% 0%," + c.bg2 + " 0%," + c.bg + " 60%);color:" + c.text + ";font-family:" + CONFIG.fonts.body + ";" +
      "-webkit-font-smoothing:antialiased;transition:opacity .6s ease,visibility .6s ease}" +
    "#site-gate.is-open{opacity:0;visibility:hidden}" +
    "#site-gate::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.07;" +
      "background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:64px 64px;" +
      "-webkit-mask-image:radial-gradient(70% 60% at 50% 40%,#000,transparent);mask-image:radial-gradient(70% 60% at 50% 40%,#000,transparent)}" +
    "#site-gate .g-card{position:relative;width:100%;max-width:560px;margin:auto;text-align:center;animation:gIn .9s cubic-bezier(.2,.7,.2,1) both}" +
    "@keyframes gIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
    "#site-gate .g-logo{height:64px;width:auto;margin:0 auto 28px;display:block}" +
    "#site-gate .g-eyebrow{display:inline-block;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#fff;opacity:.75;margin:0 0 20px}" +
    "#site-gate .g-title{font-family:" + CONFIG.fonts.head + ";font-weight:800;color:#fff;font-size:clamp(34px,7vw,58px);line-height:1.05;letter-spacing:-.02em;margin:0 0 14px}" +
    "#site-gate .g-title span{color:" + c.accent + ";filter:brightness(1.35)}" +
    "#site-gate .g-tag{font-family:" + CONFIG.fonts.head + ";font-weight:600;color:#fff;font-size:clamp(17px,2.6vw,20px);margin:0 0 14px}" +
    "#site-gate .g-text{font-size:16px;line-height:1.65;margin:0 auto 32px;max-width:460px}" +
    "#site-gate .g-bar{width:56px;height:3px;background:" + c.accent + ";margin:0 auto 32px;border:0}" +
    "#site-gate form{display:flex;gap:8px;max-width:420px;margin:0 auto}" +
    "#site-gate label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}" +
    "#site-gate input{flex:1;min-width:0;height:52px;padding:0 18px;font:inherit;font-size:16px;color:#fff;background:rgba(255,255,255,.08);" +
      "border:1px solid rgba(255,255,255,.22);border-radius:" + CONFIG.radius + ";outline:none;transition:border-color .2s,background .2s}" +
    "#site-gate input::placeholder{color:rgba(255,255,255,.55)}" +
    "#site-gate input:focus{border-color:#fff;background:rgba(255,255,255,.12)}" +
    "#site-gate button{height:52px;padding:0 26px;font:inherit;font-weight:600;font-size:15px;color:#fff;background:" + c.accent + ";border:0;" +
      "border-radius:" + CONFIG.radius + ";cursor:pointer;transition:background .2s,transform .2s}" +
    "#site-gate button:hover{background:" + c.accentHover + "}" +
    "#site-gate button:focus-visible,#site-gate input:focus-visible{outline:3px solid #fff;outline-offset:2px}" +
    "#site-gate .g-error{min-height:22px;margin:12px 0 0;font-size:14px;color:#ffb4a3}" +
    "#site-gate.shake form{animation:gShake .4s}" +
    "@keyframes gShake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}" +
    "#site-gate .g-foot{margin:36px 0 0;font-size:13px;opacity:.7}" +
    "#site-gate .g-foot a{color:#fff;text-decoration:underline;text-underline-offset:3px}" +
    "@media (max-width:480px){#site-gate form{flex-direction:column}#site-gate input{flex:none;width:100%}#site-gate button{width:100%}#site-gate .g-logo{height:52px}}" +
    "@media (prefers-reduced-motion:reduce){#site-gate,#site-gate .g-card{animation:none;transition:none}}";

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
      '<div class="g-card">' +
        '<img class="g-logo" src="' + esc(CONFIG.logo) + '" alt="' + esc(CONFIG.name) + '">' +
        '<p class="g-eyebrow">' + esc(CONFIG.eyebrow) + "</p>" +
        '<h1 class="g-title" id="site-gate-title">' + esc(CONFIG.name) + " <span>arrive bientôt</span></h1>" +
        '<p class="g-tag">' + esc(CONFIG.tagline) + "</p>" +
        '<p class="g-text">' + esc(CONFIG.text) + "</p>" +
        '<hr class="g-bar">' +
        '<form novalidate>' +
          '<label for="site-gate-pw">Mot de passe</label>' +
          '<input id="site-gate-pw" type="password" autocomplete="current-password" placeholder="Mot de passe d\'accès" required>' +
          '<button type="submit">Entrer</button>' +
        "</form>" +
        '<p class="g-error" role="alert" aria-live="polite"></p>' +
        '<p class="g-foot">Accès réservé aux partenaires pendant la pré-ouverture' +
          (CONFIG.contact ? ' · <a href="mailto:' + esc(CONFIG.contact) + '">' + esc(CONFIG.contact) + "</a>" : "") + "</p>" +
      "</div>";
    document.body.appendChild(gate);

    var form = gate.querySelector("form"), input = gate.querySelector("input"), error = gate.querySelector(".g-error");
    input.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sha256(input.value.trim()) === CONFIG.HASH) {
        try { localStorage.setItem(CONFIG.KEY, CONFIG.HASH); } catch (err) {}
        try { sessionStorage.setItem(CONFIG.KEY, CONFIG.HASH); } catch (err) {}
        root.classList.remove("site-gated");
        gate.classList.add("is-open");
        setTimeout(function () { gate.remove(); style.remove(); }, 700);
      } else {
        error.textContent = "Mot de passe incorrect.";
        gate.classList.remove("shake"); void gate.offsetWidth; gate.classList.add("shake");
        input.select();
      }
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
