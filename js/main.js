/* ===========================
   SportDat Landing — main.js
   Mobile menu, smooth scroll, forms, animations, analytics
   =========================== */

(function () {
  'use strict';

  // --- Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const menuIcon = document.querySelector('.menu-icon');
  const closeIcon = document.querySelector('.close-icon');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      if (menuIcon && closeIcon) {
        menuIcon.style.display = isOpen ? 'none' : 'block';
        closeIcon.style.display = isOpen ? 'block' : 'none';
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        if (menuIcon && closeIcon) {
          menuIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Form Validation and Submission ---
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      form.querySelectorAll('.form-group.has-error').forEach(function (group) {
        group.classList.remove('has-error');
      });

      // Validate required fields
      form.querySelectorAll('[required]').forEach(function (field) {
        const group = field.closest('.form-group') || field.closest('.privacy-check');

        if (field.type === 'checkbox') {
          if (!field.checked) {
            isValid = false;
            if (group) group.classList.add('has-error');
          }
        } else if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            isValid = false;
            if (group) group.classList.add('has-error');
          }
        } else if (field.tagName === 'SELECT') {
          if (!field.value) {
            isValid = false;
            if (group) group.classList.add('has-error');
          }
        } else {
          if (!field.value.trim()) {
            isValid = false;
            if (group) group.classList.add('has-error');
          }
        }
      });

      // Validate radio groups
      form.querySelectorAll('.radio-group[data-required]').forEach(function (group) {
        const name = group.dataset.name;
        const checked = form.querySelector('input[name="' + name + '"]:checked');
        if (!checked) {
          isValid = false;
          group.closest('.form-group').classList.add('has-error');
        }
      });

      // Validate checkbox groups (at least one checked)
      form.querySelectorAll('.checkbox-group[data-required]').forEach(function (group) {
        const checked = group.querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length === 0) {
          isValid = false;
          group.closest('.form-group').classList.add('has-error');
        }
      });

      if (isValid) {
        // Track form submission
        trackEvent('Form Submit', { form: form.id || 'unknown' });

        // Send data to Google Sheets via Apps Script
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          if (data[key]) {
            data[key] = data[key] + ', ' + value;
          } else {
            data[key] = value;
          }
        });
        data._form = form.id || 'unknown';
        data._page = window.location.pathname;
        data._timestamp = new Date().toISOString();

        // Google Apps Script URL (set in index.html before main.js)
        const SHEETS_URL = window.SPORTDAT_SHEETS_URL || '';

        if (SHEETS_URL) {
          fetch(SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(() => { /* silent fail */ });
        }

        // Show success message
        const successEl = form.closest('.form-container')
          ? form.closest('.form-container').querySelector('.form-success')
          : document.querySelector('.form-success');
        if (successEl) {
          form.style.display = 'none';
          successEl.classList.add('active');
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Track form error
        trackEvent('Form Error', { form: form.id || 'unknown' });

        // Scroll to first error
        const firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // --- Scroll Animations (IntersectionObserver) ---
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Plausible Analytics Events ---
  function trackEvent(name, props) {
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: props });
    }
  }

  // Track CTA clicks
  document.querySelectorAll('[data-track-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var location = this.dataset.trackCta || 'unknown';
      trackEvent('CTA Click', { location: location });
    });
  });

})();
