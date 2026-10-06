/* ANCRÉAL — interactions et animations du site */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- En-tête et menu mobile ---------- */
  var header = $("#header");
  var burger = $("#burger");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var nav = $("#nav");
      if (nav && header) nav.style.top = Math.max(0, header.getBoundingClientRect().bottom) + "px";
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Images : en cas d'échec de chargement, on garde le fond neutre ---------- */
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.visibility = "hidden"; });
  });

  /* ---------- Transitions entre pages ---------- */
  var veil = $(".page-veil");
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || !veil || reduce) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
    if (/^(mailto|tel|https?):/i.test(href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    closeNav();
    veil.classList.add("is-leaving");
    setTimeout(function () { location.href = url.href; }, 480);
  });
  window.addEventListener("pageshow", function () { if (veil) veil.classList.remove("is-leaving"); });

  /* ---------- Compteurs ---------- */
  function format(n) { return n.toLocaleString("fr-FR"); }
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || !target) { el.textContent = format(target); return; }
    var start = null, dur = 1800;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* ---------- Hero : vidéo locale si disponible, sinon diaporama ---------- */
  var slides = $$(".hero__slide");
  var current = 0;
  var slideTimer = null;
  if (slides.length > 1 && !reduce) {
    slideTimer = setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 6500);
  }
  var video = $("#heroVideo");
  if (video && !reduce && video.dataset.src) {
    var source = document.createElement("source");
    source.src = video.dataset.src;
    source.type = "video/mp4";
    source.addEventListener("error", function () { video.remove(); });
    video.appendChild(source);
    video.addEventListener("canplay", function () {
      var p = video.play();
      if (p && p.then) {
        p.then(function () {
          video.classList.add("is-ready");
          if (slideTimer) clearInterval(slideTimer);
        }).catch(function () {});
      }
    }, { once: true });
    video.preload = "auto";
    video.load();
  }

  /* ---------- Sommaire de page : lien actif ---------- */
  var subLinks = $$(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        subLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    subLinks.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* ---------- Simulateur du cercle fondateur ---------- */
  var range = $("#simRange");
  if (range) {
    var APPORT = 30000, COUT_OPERATION = 100000, PART = 3000;
    var presets = $$(".sim__presets button");
    var update = function () {
      var v = parseInt(range.value, 10);
      var share = Math.min(v / APPORT * 100, 100);
      var seats = Math.max(1, Math.floor(v / PART));
      $(".js-sim-amount").textContent = format(v);
      $(".js-sim-share").textContent = share.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
      $(".js-sim-bar").style.width = share + "%";
      $(".js-sim-leverage").textContent = format(Math.round(v * COUT_OPERATION / APPORT / 100) * 100);
      $(".js-sim-seats").textContent = v >= PART ? seats : "—";
      $(".js-sim-seats-label").textContent = v >= PART ? (seats > 1 ? "places" : "place") : "contributeur associé";
      presets.forEach(function (b) { b.classList.toggle("is-active", parseInt(b.dataset.value, 10) === v); });
    };
    range.addEventListener("input", update);
    presets.forEach(function (b) {
      b.addEventListener("click", function () { range.value = b.dataset.value; update(); });
    });
    update();
  }

  /* ---------- Formulaire de contact ----------
     Par défaut : ouvre la messagerie du visiteur avec le message pré-rempli.
     Pour recevoir les messages directement (ex. Formspree), ajouter
     data-endpoint="https://formspree.io/f/XXXX" sur la balise <form>. */
  var EMAIL = "contact@groupecohesif.com";
  var form = $("#contactForm");
  if (form) {
    var params = new URLSearchParams(location.search);
    var profile = $("#f-profile");
    if (params.get("profil") && profile) profile.value = params.get("profil");
    if (params.get("objet") === "dossier") $("#f-msg").value = "Bonjour, je souhaite recevoir le dossier de présentation d'Ancréal (statuts, business plan).";
    var status = $("#formStatus");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity() || !$("#f-consent").checked) {
        status.style.color = "#b3403a";
        status.textContent = "Merci de compléter les champs obligatoires (*).";
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var endpoint = form.getAttribute("data-endpoint");
      status.style.color = "";
      if (endpoint) {
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            form.reset();
            status.textContent = "Merci ! Votre message a bien été envoyé.";
          })
          .catch(function () {
            status.style.color = "#b3403a";
            status.textContent = "L'envoi a échoué. Écrivez-nous à " + EMAIL + ".";
          });
        return;
      }
      var label = profile.options[profile.selectedIndex].text;
      var subject = "[Ancréal] " + label + " — " + data.get("name");
      var body = [
        "Nom : " + data.get("name"),
        "Organisation : " + (data.get("org") || "—"),
        "E-mail : " + data.get("email"),
        "Téléphone : " + (data.get("phone") || "—"),
        "Profil : " + label,
        "",
        data.get("message")
      ].join("\n");
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Votre messagerie s'ouvre pour finaliser l'envoi.";
    });
  }

  /* ---------- Lettre d'information ---------- */
  $$(".js-newsletter").forEach(function (nl) {
    nl.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input[type=email]", nl);
      var msg = $(".js-newsletter-status");
      if (!input.checkValidity() || !input.value) { input.reportValidity(); return; }
      var endpoint = nl.getAttribute("data-endpoint");
      if (endpoint) {
        fetch(endpoint, { method: "POST", body: new FormData(nl), headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(); nl.reset(); if (msg) msg.textContent = "Merci, votre inscription est enregistrée."; })
          .catch(function () { if (msg) msg.textContent = "L'inscription a échoué. Réessayez plus tard."; });
        return;
      }
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Inscription aux nouvelles d'Ancréal") +
        "&body=" + encodeURIComponent("Merci de m'inscrire aux nouvelles d'Ancréal : " + input.value);
      if (msg) msg.textContent = "Votre messagerie s'ouvre pour confirmer l'inscription.";
    });
  });

  /* ==========================================================================
     ANIMATIONS (GSAP + ScrollTrigger + SplitText + Lenis)
     ========================================================================== */
  function showAll() {
    $$(".img-reveal").forEach(function (el) { el.classList.add("is-in"); });
    $$(".manifesto__text").forEach(function (el) { el.style.opacity = 1; });
  }
  if (!hasGsap || reduce) { showAll(); initStoryFallback(); return; }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = typeof window.SplitText !== "undefined";
  if (hasSplit) gsap.registerPlugin(window.SplitText);

  /* Défilement fluide */
  if (typeof window.Lenis !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
    var lenis = new window.Lenis({ lerp: 0.1, anchors: { offset: -150 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
  }

  var EASE = "power4.out";

  /* Titres : révélation ligne par ligne */
  $$("[data-anim='lines']").forEach(function (el) {
    var inHero = el.closest(".hero, .page-hero, #contact");
    if (!hasSplit) {
      gsap.from(el, { y: 40, autoAlpha: 0, duration: 1.1, ease: EASE, scrollTrigger: inHero ? null : { trigger: el, start: "top 88%" } });
      return;
    }
    window.SplitText.create(el, {
      type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.lines, {
          yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.09, delay: inHero ? 0.25 : 0,
          scrollTrigger: inHero ? null : { trigger: el, start: "top 88%" }
        });
      }
    });
  });

  /* Paragraphes : apparition mot à mot */
  $$("[data-anim='words']").forEach(function (el) {
    if (!hasSplit) return;
    window.SplitText.create(el, {
      type: "words", autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.words, {
          autoAlpha: 0.08, duration: 0.6, stagger: 0.025, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 80%" }
        });
      }
    });
  });

  /* Manifeste : les mots s'allument au fil du défilement */
  $$("[data-anim='scrub-words']").forEach(function (el) {
    if (!hasSplit) return;
    window.SplitText.create(el, {
      type: "words", wordsClass: "word", autoSplit: true,
      onSplit: function (self) {
        return gsap.to(self.words, {
          opacity: 1, stagger: 0.1, ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
        });
      }
    });
  });

  /* Apparitions simples */
  $$("[data-anim='fade']").forEach(function (el) {
    var inHero = el.closest(".hero, .page-hero");
    gsap.from(el, {
      y: 30, autoAlpha: 0, duration: 1.1, ease: EASE, delay: inHero ? 0.55 : 0,
      scrollTrigger: inHero ? null : { trigger: el, start: "top 90%" }
    });
  });

  /* Apparitions en cascade */
  $$("[data-anim='stagger']").forEach(function (el) {
    gsap.from(el.children, {
      y: 40, autoAlpha: 0, duration: 1, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* Images : dévoilement */
  $$("[data-anim='reveal']").forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: function () { el.classList.add("is-in"); } });
  });

  /* Parallaxe */
  $$("[data-parallax]").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
      yPercent: 6, scale: 1.14, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });
  $$("[data-parallax-bg]").forEach(function (bg) {
    gsap.fromTo(bg, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: bg.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* Hero d'accueil : léger zoom arrière au défilement */
  var heroMedia = $(".hero__media");
  if (heroMedia) {
    gsap.to(heroMedia, { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* Histoire épinglée du modèle */
  var steps = $$(".story__step");
  var imgs = $$(".story__img");
  var num = $(".js-story-num");
  function activate(i) {
    steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
    imgs.forEach(function (im, k) { im.classList.toggle("is-active", k === i); });
    if (num) num.textContent = ("0" + (i + 1)).slice(-2);
  }
  steps.forEach(function (step, i) {
    ScrollTrigger.create({
      trigger: step, start: "top 60%", end: "bottom 60%",
      onEnter: function () { activate(i); }, onEnterBack: function () { activate(i); }
    });
  });

  /* Recalcul après chargement des polices et images */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  function initStoryFallback() {
    var first = $(".story__img");
    if (first) first.classList.add("is-active");
  }
})();
