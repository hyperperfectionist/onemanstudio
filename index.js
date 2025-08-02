// --- Device & Screen Size Detection ---
function shouldRunAnimations() {
  if (window.innerWidth < 1024) return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile', 'iphone', 'ipod', 'android', 'blackberry',
    'windows phone', 'webos', 'opera mini'
  ];
  const tabletKeywords = [
    'ipad', 'tablet', 'kindle', 'silk', 'playbook', 'nexus 7',
    'nexus 10', 'xoom', 'sch-i800', 'android 3'
  ];
  const isMobile = mobileKeywords.some(k => userAgent.includes(k));
  const isTablet = tabletKeywords.some(k => userAgent.includes(k));
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return !(isMobile || isTablet || (isTouchDevice && window.innerWidth <= 1024));
}

// --- Resize Handling ---
let animationsAllowed = shouldRunAnimations();

function handleResizeCheck() {
  const newStatus = shouldRunAnimations();

  if (animationsAllowed !== newStatus) {
    console.warn('Screen threshold crossed. Reloading to apply animation state.');
    location.reload();
  }

  animationsAllowed = newStatus;
}

window.addEventListener('resize', handleResizeCheck);


// --- Run Animation Code If Allowed ---
if (animationsAllowed) {

  // --- Lenis Scroll Setup ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on('scroll', ({ scroll }) => {
    const heroSection = document.querySelector('.hero');
    const nextSection = heroSection?.nextElementSibling;

    if (heroSection && nextSection) {
      const heroRect = heroSection.getBoundingClientRect();

      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        const heroTranslateY = scroll * 0.2;
        heroSection.style.transform = `translateY(${heroTranslateY}px)`;
        nextSection.style.transform = `translateY(0px)`;
      } else {
        heroSection.style.transform = `translateY(0px)`;
        nextSection.style.transform = `translateY(0px)`;
      }
    }
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // --- Smooth Scroll Links ---
  document.querySelectorAll("[data-lenis-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  // --- Hero Image + Title Switcher (Shery.js + GSAP) ---
  const heroTitles = ["Visionaries", "Champions", "Founders", "Hustlers", "Startups"];
  const heroImages = document.querySelectorAll(".hero-backgrounds-container .hero-background");
  const heroTitleSpan = document.querySelector(".hero-content h1 span");

  
  let heroCurrentIndex = 0;
  let heroTitleSwitchLocked = false;
  const heroTitleSwitchDelay = 1500;

  const heroShery = Shery.imageEffect(".hero-backgrounds-container", {
    style: 6,
    gooey: true,
    config: {
      noiseDetail: { value: 100 },
      distortionAmount: { value: 0 },
      scale: { value: 0 },
      speed: { value: 1 },
      zindex: { value: -9996999 },
      aspect: { value: 2.002 },
      ignoreShapeAspect: { value: true },
      shapePosition: { value: { x: 0, y: 0 } },
      shapeScale: { value: { x: 1, y: 1 } },
      shapeEdgeSoftness: { value: 0 },
      shapeRadius: { value: 0 },
      currentScroll: { value: 0 },
      scrollLerp: { value: 0 },
      gooey: { value: true },
      infiniteGooey: { value: true },
      growSize: { value: 5 },
      durationOut: { value: 1.5 },
      durationIn: { value: 1 },
      displaceAmount: { value: 0.5 },
      masker: { value: true },
      maskVal: { value: 1 },
      scrollType: { value: 0 },
      geoVertex: { value: 1 },
      noEffectGooey: { value: true },
      onMouse: { value: 0 },
      noise_speed: { value: 0.2 },
      metaball: { value: 0.09 },
      discard_threshold: { value: 0.75 },
      antialias_threshold: { value: 0.1 },
      noise_height: { value: 0.4 },
      noise_scale: { value: 20 },
      a: { value: 2 },
      b: { value: 1 },
    },
  });

  if (heroTitleSpan) {
    heroTitleSpan.textContent = heroTitles[heroCurrentIndex];

    const handleHeroImageClick = () => {
      if (heroTitleSwitchLocked) return;
      heroTitleSwitchLocked = true;

      heroCurrentIndex = (heroCurrentIndex + 1) % heroImages.length;
      const newTitle = heroTitles[heroCurrentIndex];

      gsap.to(heroTitleSpan, {
        y: -40,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          heroTitleSpan.textContent = newTitle;
          gsap.fromTo(
            heroTitleSpan,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        },
      });

      if (heroShery && typeof heroShery.refresh === "function") {
        heroShery.refresh();
      }

      setTimeout(() => {
        heroTitleSwitchLocked = false;
      }, heroTitleSwitchDelay);
    };

    heroImages.forEach((img) => {
      img.addEventListener("mousedown", handleHeroImageClick);
    });
  }


  

  // --- Reveal Text Animation (SplitType + GSAP ScrollTrigger using opacity) ---
  gsap.registerPlugin(ScrollTrigger);
  const splitTypes = document.querySelectorAll('.reveal-type');
  let timeline = gsap.timeline();

  splitTypes.forEach((el, i) => {
    const split = new SplitType(el, { types: 'words' });

    split.words.forEach((word, idx) => {
      word.style.display = 'inline-block';
      if (idx < split.words.length - 1) {
        const space = document.createTextNode(' ');
        word.parentNode.insertBefore(space, word.nextSibling);
      }
    });

    gsap.set(split.words, { opacity: 0.2,});

    timeline.fromTo(
      split.words,
      { opacity: 0.2 },
      { opacity: 1, duration: .5, stagger: .01, ease: 'power3.out' },
      i === 0 ? 0 : '>'
    );
  });

  ScrollTrigger.create({
    trigger: splitTypes[0],
    start: 'top 60%',
    end: '100% 20%',
    scrub: 1,
    markers: false,
    animation: timeline,
    toggleActions: 'play play reverse reverse'
  });

} else {
  console.log('Animations disabled for mobile/tablet devices or screens < 1024px');
}















const projects = document.querySelectorAll(".project");

const imageSources = [
  { before: "qw-before.webp", after: "qw.webp" },
  { before: "coral-before.webp", after: "coral.webp" },
  { before: "pb-before.webp", after: "pb.webp" },
  { before: "kati-before.webp", after: "kati.webp" },
  { before: "law.webp", after: "law.webp" },
];

const baseURL = "https://ik.imagekit.io/onemanstudio/";

const buildSrcset = (filename) => `
  ${baseURL}${filename}?tr=w-400,f-webp 400w,
  ${baseURL}${filename}?tr=w-800,f-webp 800w,
  ${baseURL}${filename}?tr=w-1200,f-webp 1200w
`.trim();

const sizes = "(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw";

projects.forEach((project, index) => {
  const beforeBtn = project.querySelector(".comparison button:first-child");
  const afterBtn = project.querySelector(".comparison button:last-child");
  const img = project.querySelector(".project-thumbnail-img");

  if (!beforeBtn || !afterBtn || !img) return;

  // Preload both before and after images
  const preloadImage = (filename) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = `${baseURL}${filename}?tr=w-800,f-webp`;
    document.head.appendChild(link);
  };

  // Preload both images for this project
  preloadImage(imageSources[index].before);
  preloadImage(imageSources[index].after);

  const setImage = (type, priority = "low") => {
    const filename = imageSources[index][type];
    img.style.opacity = 0;

    img.src = `${baseURL}${filename}?tr=w-800,f-webp`;
    img.srcset = buildSrcset(filename);
    img.sizes = sizes;
    img.loading = priority === "high" ? "eager" : "lazy";
    img.decoding = "async";
    img.fetchPriority = priority;

    requestAnimationFrame(() => {
      img.style.opacity = 1;
    });
  };

  beforeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setImage("before");
    beforeBtn.classList.add("active");
    beforeBtn.classList.remove("inactive");
    afterBtn.classList.add("inactive");
    afterBtn.classList.remove("active");
  });

  afterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setImage("after");
    afterBtn.classList.add("active");
    afterBtn.classList.remove("inactive");
    beforeBtn.classList.add("inactive");
    beforeBtn.classList.remove("active");
  });

  // Load first image eagerly, rest lazily
  const priority = index === 0 ? "high" : "low";
  setImage("after", priority);
});
