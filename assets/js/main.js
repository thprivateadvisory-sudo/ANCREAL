/* ANCRÉAL — interactions du site */
(function () {
  "use strict";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  /* En-tête : fond au défilement */
  function onScroll() {
    if (!header || header.classList.contains("header--solid")) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  function closeNav() {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  if (nav) nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* Lien actif selon la section visible */
  var links = document.querySelectorAll('.nav__links a[href^="#"]');
  if ("IntersectionObserver" in window && links.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* Apparition au défilement */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Compteurs animés */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function format(n) { return n.toLocaleString("fr-FR"); }
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || !target) { el.textContent = format(target); return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* Hero : vidéo locale si disponible, sinon diaporama */
  var slides = document.querySelectorAll(".hero__slide");
  var current = 0;
  var slideTimer = null;
  if (slides.length > 1 && !reduce) {
    slideTimer = setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 6500);
  }
  var video = document.getElementById("heroVideo");
  if (video && !reduce && video.dataset.src) {
    video.addEventListener("canplay", function () {
      video.classList.add("is-ready");
      if (slideTimer) clearInterval(slideTimer);
      var p = video.play();
      if (p && p.catch) p.catch(function () { video.classList.remove("is-ready"); });
    }, { once: true });
    video.addEventListener("error", function () { video.remove(); }, true);
    var source = document.createElement("source");
    source.src = video.dataset.src;
    source.type = "video/mp4";
    source.addEventListener("error", function () { video.remove(); });
    video.appendChild(source);
    video.load();
  }

  /* Images : si une photo ne se charge pas, on garde le dégradé de marque */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.display = "none"; });
  });

  /* Onglets partenaires */
  var tabs = document.querySelectorAll(".tab");
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.classList.toggle("is-active", on);
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* Accès rapide : ouvre l'onglet partenaire correspondant */
  document.querySelectorAll(".js-tab").forEach(function (link) {
    link.addEventListener("click", function () {
      var tab = document.getElementById(link.getAttribute("data-tab"));
      if (tab) selectTab(tab);
    });
  });

  /* Pré-remplissage du profil depuis les boutons partenaires */
  var profileSelect = document.getElementById("f-profile");
  document.querySelectorAll(".js-profile").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (profileSelect) profileSelect.value = btn.getAttribute("data-profile");
    });
  });

  /* Formulaire de contact
     Par défaut : ouvre la messagerie du visiteur avec le message pré-rempli.
     Pour recevoir les messages directement, renseignez un service de formulaire
     (ex. Formspree) dans data-endpoint sur la balise <form>. */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity() || !document.getElementById("f-consent").checked) {
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
            if (!r.ok) throw new Error();
            form.reset();
            status.textContent = "Merci ! Votre message a bien été envoyé.";
          })
          .catch(function () {
            status.style.color = "#b3403a";
            status.textContent = "L'envoi a échoué. Écrivez-nous à contact@groupecohesif.com.";
          });
        return;
      }
      var subject = "[Ancréal] " + data.get("profile") + " — " + data.get("name");
      var body = [
        "Nom : " + data.get("name"),
        "Organisation : " + (data.get("org") || "—"),
        "E-mail : " + data.get("email"),
        "Téléphone : " + (data.get("phone") || "—"),
        "Profil : " + data.get("profile"),
        "",
        data.get("message")
      ].join("\n");
      window.location.href = "mailto:contact@groupecohesif.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Votre messagerie s'ouvre pour finaliser l'envoi.";
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
