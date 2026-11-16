/* ========== FASTANALYTICS - MAIN JS ========== */

(function () {
  'use strict';

  // ========== LANGUAGE TOGGLE ==========
  var PRES_VIDEO_SOURCES = {
    es: 'assets/demo/00-presentacion-empresa.mp4?v=5',
    en: 'assets/demo/00-presentacion-empresa-en.mp4?v=1',
    fr: 'assets/demo/00-presentacion-empresa-fr.mp4?v=1'
  };

  function syncPresVideo() {
    var video = document.getElementById('presVideo');
    if (!video) return;
    var lang = document.documentElement.lang;
    var src = PRES_VIDEO_SOURCES[lang] || PRES_VIDEO_SOURCES.es;
    if (video.getAttribute('src') !== src) {
      video.pause();
      video.setAttribute('src', src);
      video.load();
    }
  }

  const langToggle = document.getElementById('langToggle');
  const langOptions = langToggle ? langToggle.querySelectorAll('.lang-option') : [];
  let currentLang = 'es';
  var langCycle = ['es', 'en', 'fr'];
  var presentationPdfLink = document.getElementById('presentationPdf');
  var presentationPdfHrefs = {
    es: 'assets/demo/Presentacion_FastAnalytics.pdf',
    en: 'assets/demo/Presentacion_FastAnalytics_EN.pdf',
    fr: 'assets/demo/Presentacion_FastAnalytics_FR.pdf'
  };

  function updatePresentationPdf(lang) {
    if (presentationPdfLink) {
      presentationPdfLink.setAttribute('href', presentationPdfHrefs[lang] || presentationPdfHrefs.es);
    }
  }

  // Decodifica entidades HTML (&lt;, &quot;, ...) para que el marcado
  // interno (<a>, <strong>) sobreviva al cambio de idioma
  function decodeEntities(text) {
    var ta = document.createElement('textarea');
    ta.innerHTML = text;
    return ta.value;
  }

  function setLanguage(lang) {
    if (langCycle.indexOf(lang) === -1) lang = 'es';
    currentLang = lang;
    document.documentElement.lang = lang;
    updatePresentationPdf(lang);

    try {
      localStorage.setItem('fa-lang', lang);
    } catch (e) {}

    // Update toggle buttons
    langOptions.forEach(function (opt) {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) {
        el.innerHTML = decodeEntities(text);
      }
    });
    syncPresVideo();

    // Nota: el <title> ya no se redefine aquí. Hay un único título por página,
    // fijado en el HTML (rediseño home 2026: "FastAnalytics | Ciencia de datos
    // e IA para seguridad, defensa y riesgos").
  }

  var initialLang = 'es';
  try {
    var savedLang = localStorage.getItem('fa-lang');
    if (langCycle.indexOf(savedLang) !== -1) initialLang = savedLang;
  } catch (e) {}
  setLanguage(initialLang);

  // ========== HERO ROTATING WORD ==========
  var heroRotate = document.getElementById('heroRotate');
  if (heroRotate) {
    var rotateWords = {
      es: ['riesgos', 'delitos', 'fraudes', 'atentados'],
      en: ['risks', 'crimes', 'fraud', 'attacks'],
      fr: ['risques', 'délits', 'fraudes', 'attentats']
    };
    var rotateIndex = 0;

    function currentRotateLang() {
      var lang = document.documentElement.lang;
      return rotateWords[lang] ? lang : 'es';
    }

    function setRotateWord() {
      heroRotate.textContent = rotateWords[currentRotateLang()][rotateIndex % rotateWords[currentRotateLang()].length];
    }

    setInterval(function () {
      rotateIndex++;
      heroRotate.classList.add('swap');
      setTimeout(function () {
        setRotateWord();
        heroRotate.classList.remove('swap');
      }, 350);
    }, 2800);

    // Si el usuario cambia de idioma, mostrar la palabra en ese idioma
    new MutationObserver(function () { setRotateWord(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (langToggle) {
    langToggle.addEventListener('click', function (e) {
      var option = e.target.closest('.lang-option');
      if (option) {
        setLanguage(option.dataset.lang);
      } else {
        // Cycle through languages
        var idx = langCycle.indexOf(currentLang);
        setLanguage(langCycle[(idx + 1) % langCycle.length]);
      }
    });
  }

  // ========== NAVBAR SCROLL ==========
  var navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ========== MOBILE MENU ==========
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========== SCROLL ANIMATIONS ==========
  var animatedElements = document.querySelectorAll('.animate-on-scroll');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(function (el) {
    observer.observe(el);
  });

  // ========== ACTIVE NAV LINK ON SCROLL ==========
  var sections = document.querySelectorAll('section[id]');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && navLinks) {
        var id = entry.target.id;
        navLinks.querySelectorAll('a').forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ========== AGENDA POR CORREO ==========
  if (location.hash === '#agenda') {
    window.location.href = 'mailto:hola@fastanalytics.co?subject=Solicitud%20de%20demostraci%C3%B3n%20FastAnalytics&body=Hola%20FastAnalytics%3A%0A%0AQuiero%20agendar%20una%20demostraci%C3%B3n.%0A%0AGracias.';
  }

  // ========== LIGHTBOX ==========
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lightboxCounter = document.getElementById('lightboxCounter');

    var currentGallery = [];
    var currentIndex = 0;

    function updateLightbox() {
      var img = currentGallery[currentIndex];
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || '';
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGallery.length;
      var multiple = currentGallery.length > 1;
      lightboxPrev.style.display = multiple ? 'flex' : 'none';
      lightboxNext.style.display = multiple ? 'flex' : 'none';
      lightboxCounter.style.display = multiple ? 'block' : 'none';
    }

    function openLightbox(gallery, index) {
      currentGallery = gallery;
      currentIndex = index;
      updateLightbox();
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightbox();
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      updateLightbox();
    }

    var gallerySelectors = ['.alejo-screenshots', '.predice-screenshots', '.tavodebate-screenshots'];
    gallerySelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (gallery) {
        var images = Array.prototype.slice.call(gallery.querySelectorAll('img'));
        images.forEach(function (img, idx) {
          img.addEventListener('click', function () {
            openLightbox(images, idx);
          });
        });
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'ArrowRight') nextImage();
    });
  }


  // ========== VIDEO MODAL (AlejoSeguro) ==========
  var videoModal = document.getElementById('videoModal');
  if (videoModal) {
    var videoPlayer = document.getElementById('videoPlayer');

    function openVideo() {
      videoModal.classList.add('active');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      videoPlayer.currentTime = 0;
      var pr = videoPlayer.play();
      if (pr && pr.catch) pr.catch(function () {});
    }

    function closeVideo() {
      videoPlayer.pause();
      videoModal.classList.remove('active');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('a[href="#video-alejoseguro"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openVideo();
      });
    });

    document.getElementById('videoClose').addEventListener('click', closeVideo);
    document.getElementById('videoBackdrop').addEventListener('click', closeVideo);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideo();
    });
  }

  // ========== MODAL: PRESENTACIÓN DE LA EMPRESA ==========
  var presModal = document.getElementById('presModal');
  var presVideo = document.getElementById('presVideo');
  var openPres = document.getElementById('openPres');

  if (presModal && presVideo && openPres) {
    function openPresModal() {
      presModal.hidden = false;
      document.body.classList.add('pres-open');
      presVideo.play().catch(function () {});
    }
    function closePresModal() {
      presVideo.pause();
      presVideo.currentTime = 0;
      presModal.hidden = true;
      document.body.classList.remove('pres-open');
    }
    openPres.addEventListener('click', openPresModal);
    presModal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closePresModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !presModal.hidden) closePresModal();
    });
    // Mientras el video corporativo no esté publicado, avisar con elegancia
    presVideo.addEventListener('error', function () {
      var dialog = presVideo.closest('.pres-dialog');
      if (dialog && !dialog.querySelector('.pres-soon')) {
        var msg = document.createElement('p');
        msg.className = 'pres-soon';
        msg.setAttribute('data-es', 'La presentación corporativa estará disponible muy pronto.');
        msg.setAttribute('data-en', 'The corporate presentation will be available very soon.');
        msg.setAttribute('data-fr', 'La présentation d&#8217;entreprise sera très bientôt disponible.');
        var lang = document.documentElement.lang === 'en' ? 'data-en' : (document.documentElement.lang === 'fr' ? 'data-fr' : 'data-es');
        msg.textContent = msg.getAttribute(lang);
        presVideo.style.display = 'none';
        dialog.appendChild(msg);
      }
    });
  }

})();
