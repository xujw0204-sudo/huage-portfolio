const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrev = lightbox.querySelector(".lightbox-prev");
const lightboxNext = lightbox.querySelector(".lightbox-next");
const lightboxCount = lightbox.querySelector(".lightbox-count");
const triggers = [...document.querySelectorAll(".image-trigger")];
let activeIndex = 0;
let lastFocus = null;

const showImage = () => {
  const image = triggers[activeIndex].querySelector("img");
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCount.textContent = `${activeIndex + 1} / ${triggers.length}`;
};

const openLightbox = (trigger) => {
  activeIndex = triggers.indexOf(trigger);
  if (activeIndex < 0) return;
  lastFocus = trigger;
  showImage();
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  lightboxClose.focus();
};

const moveLightbox = (step) => {
  activeIndex = (activeIndex + step + triggers.length) % triggers.length;
  showImage();
};

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.classList.remove("no-scroll");
  if (lastFocus) lastFocus.focus();
};

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => moveLightbox(-1));
lightboxNext.addEventListener("click", () => moveLightbox(1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

window.addEventListener("beforeprint", () => {
  lightbox.hidden = true;
  document.body.classList.remove("no-scroll");
});
