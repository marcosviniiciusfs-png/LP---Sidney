(() => {
  "use strict";

  const config = window.LP_CONFIG || {};
  const dataLayer = (window.dataLayer = window.dataLayer || []);

  const track = (event, parameters = {}) => {
    dataLayer.push({ event, ...parameters });
  };

  const installGtm = () => {
    if (!config.gtmId) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`;
    document.head.append(script);
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  };

  installGtm();
  track("view_landing_page");

  const whatsappNumber = String(config.whatsappNumber || "5594991360408").replace(/\D/g, "");
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = `https://wa.me/${whatsappNumber}`;
    link.addEventListener("click", () => {
      track("click_whatsapp", { position: link.dataset.whatsappPosition || "unknown" });
    });
  });

  const revealElements = document.querySelectorAll(".reveal:not(.is-visible)");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const heroVideo = document.querySelector(".hero__video");
  const heroToggle = document.querySelector('[data-media-toggle="hero"]');
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setHeroPaused = (paused) => {
    if (!heroVideo || !heroToggle) return;
    if (paused) heroVideo.pause();
    else heroVideo.play().catch(() => {});
    heroToggle.setAttribute("aria-pressed", String(paused));
    const label = paused ? "Reproduzir vídeo" : "Pausar vídeo";
    heroToggle.setAttribute("aria-label", label);
    heroToggle.querySelector(".media-toggle__label").textContent = label;
  };

  if (reduceMotion.matches) setHeroPaused(true);
  heroToggle?.addEventListener("click", () => {
    const shouldPause = heroToggle.getAttribute("aria-pressed") !== "true";
    setHeroPaused(shouldPause);
    track("video_control", { video: "hero", action: shouldPause ? "pause" : "play" });
  });

  const carousel = document.querySelector(".carousel");
  const carouselTrack = document.querySelector(".carousel__track");
  const carouselPause = document.querySelector(".carousel-controls__pause");
  let carouselTracked = false;

  carouselPause?.addEventListener("click", () => {
    const paused = carouselPause.getAttribute("aria-pressed") !== "true";
    carouselPause.setAttribute("aria-pressed", String(paused));
    carouselPause.querySelector("b").textContent = paused ? "Retomar movimento" : "Pausar movimento";
    carouselTrack.style.animationPlayState = paused ? "paused" : "running";
    track("carousel_control", { action: paused ? "pause" : "play" });
  });

  const trackCarouselInteraction = () => {
    if (carouselTracked) return;
    carouselTracked = true;
    track("carousel_interaction");
  };
  carousel?.addEventListener("pointerdown", trackCarouselInteraction, { once: true });
  carousel?.addEventListener("keydown", trackCarouselInteraction, { once: true });

  document.querySelectorAll("video[data-track-video]").forEach((video) => {
    const videoName = video.dataset.trackVideo;
    const milestones = new Set();

    const trackStart = () => {
      if (milestones.has("start")) return;
      milestones.add("start");
      track("video_start", { video: videoName });
    };

    const trackComplete = () => {
      if (milestones.has("complete")) return;
      milestones.add("complete");
      track("video_complete", { video: videoName });
    };

    video.addEventListener("play", trackStart);
    if (!video.paused) trackStart();

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const progress = video.currentTime / video.duration;
      if (progress >= 0.25 && !milestones.has("25")) {
        milestones.add("25");
        track("video_25", { video: videoName });
      }
      if (progress >= 0.95) trackComplete();
    });

    video.addEventListener("ended", trackComplete);
  });

  const modal = document.querySelector("#lead-modal");
  const form = document.querySelector("#lead-form");
  const openButtons = document.querySelectorAll(".js-open-form");
  const closeButton = modal?.querySelector(".lead-modal__close");
  const backButton = form?.querySelector(".form-back");
  const nextButton = form?.querySelector(".form-next");
  const submitButton = form?.querySelector(".form-submit");
  const formStatus = form?.querySelector(".form-status");
  const steps = form ? [...form.querySelectorAll(".form-step")] : [];
  let currentStep = 1;
  let opener = null;

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const searchParams = new URLSearchParams(window.location.search);
  utmKeys.forEach((key) => {
    const field = form?.elements.namedItem(key);
    if (field) field.value = searchParams.get(key) || "";
  });

  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const updateStep = (nextStep, direction = "forward") => {
    currentStep = Math.max(1, Math.min(steps.length, nextStep));
    steps.forEach((step, index) => {
      const active = index + 1 === currentStep;
      step.classList.toggle("is-active", active);
      step.hidden = !active;
    });

    modal.querySelectorAll("[data-progress]").forEach((item) => {
      const stepNumber = Number(item.dataset.progress);
      item.classList.toggle("is-active", stepNumber === currentStep);
      item.classList.toggle("is-complete", stepNumber < currentStep);
      if (stepNumber === currentStep) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === steps.length;
    submitButton.hidden = currentStep !== steps.length;
    formStatus.textContent = `Etapa ${currentStep} de ${steps.length}`;

    const activeField = steps[currentStep - 1].querySelector("input:not([type='radio']):not([type='checkbox']), input[type='radio']");
    window.setTimeout(() => activeField?.focus(), direction === "initial" ? 80 : 30);
  };

  const clearError = (field) => {
    field.removeAttribute("aria-invalid");
    const errorId = field.getAttribute("aria-describedby");
    if (errorId) {
      const error = document.getElementById(errorId);
      if (error) error.textContent = "";
    }
  };

  const setError = (field, message, errorElement) => {
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorElement.id);
    errorElement.textContent = message;
    field.focus();
    return false;
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep - 1];
    const name = form.elements.namedItem("name");
    const phone = form.elements.namedItem("phone");
    const email = form.elements.namedItem("email");
    const interest = form.querySelector("input[name='interest']:checked");
    const consent = form.elements.namedItem("privacy_consent");

    if (currentStep === 1) {
      clearError(name);
      if (name.value.trim().length < 2) return setError(name, "Informe seu nome para continuar.", step.querySelector(".field-error"));
    }

    if (currentStep === 2) {
      clearError(phone);
      if (phone.value.replace(/\D/g, "").length < 10) return setError(phone, "Informe um WhatsApp com DDD.", step.querySelector(".field-error"));
    }

    if (currentStep === 3) {
      clearError(email);
      if (!email.validity.valid) return setError(email, "Digite um e-mail válido.", step.querySelector(".field-error"));
    }

    if (currentStep === 4) {
      const error = step.querySelector(".field-error");
      error.textContent = "";
      if (!interest) {
        error.textContent = "Escolha uma opção para continuar.";
        step.querySelector("input[name='interest']").focus();
        return false;
      }
      if (!consent.checked) {
        error.textContent = "Confirme a autorização de contato e a leitura da política de privacidade.";
        consent.focus();
        return false;
      }
    }

    return true;
  };

  const openModal = (button) => {
    if (!modal || !form) return;
    opener = button;
    track("click_schedule_cta", { position: button.dataset.ctaPosition || "unknown" });
    form.reset();
    utmKeys.forEach((key) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = searchParams.get(key) || "";
    });
    form.querySelectorAll("[aria-invalid]").forEach(clearError);
    form.querySelectorAll(".field-error").forEach((error) => (error.textContent = ""));
    updateStep(1, "initial");
    modal.showModal();
    document.body.classList.add("modal-open");
    track("open_lead_form", { position: button.dataset.ctaPosition || "unknown" });
  };

  const closeModal = () => {
    if (!modal?.open) return;
    modal.close();
    document.body.classList.remove("modal-open");
    window.setTimeout(() => opener?.focus(), 0);
  };

  openButtons.forEach((button) => button.addEventListener("click", () => openModal(button)));
  closeButton?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  modal?.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  modal?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll(focusableSelector)].filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    track("form_step_complete", { step: currentStep });
    updateStep(currentStep + 1);
  });

  backButton?.addEventListener("click", () => updateStep(currentStep - 1, "back"));

  const phoneInput = form?.elements.namedItem("phone");
  phoneInput?.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) phoneInput.value = digits.replace(/^(\d{0,2})/, "($1");
    else if (digits.length <= 7) phoneInput.value = digits.replace(/^(\d{2})(\d+)/, "($1) $2");
    else phoneInput.value = digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    formStatus.textContent = "Abrindo o atendimento seguro no WhatsApp…";

    const values = Object.fromEntries(new FormData(form));
    const attribution = utmKeys
      .filter((key) => values[key])
      .map((key) => `${key}: ${values[key]}`)
      .join(" | ");
    const message = [
      "Olá! Acessei a página de rinoplastia do Dr. Sidney Colares e gostaria de falar com a equipe.",
      "",
      `Nome: ${values.name}`,
      `WhatsApp informado: ${values.phone}`,
      `E-mail: ${values.email}`,
      `Interesse: ${values.interest}`,
      attribution ? `Origem: ${attribution}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    track("generate_lead", { form: "evaluation", destination: "whatsapp" });
    track("lead_handoff_whatsapp", { form: "evaluation", step_count: steps.length });
    const destination = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    const newWindow = window.open(destination, "_blank", "noopener,noreferrer");
    if (!newWindow) window.location.href = destination;

    window.setTimeout(() => {
      form.removeAttribute("aria-busy");
      submitButton.disabled = false;
      formStatus.textContent = "Conversa aberta no WhatsApp.";
    }, 700);
  });
})();
