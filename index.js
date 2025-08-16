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
    location.reload();
  }

  animationsAllowed = newStatus;
}

window.addEventListener('resize', handleResizeCheck);

// --- Hide .reveal-type span if animations are not allowed ---
if (!animationsAllowed) {
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.reveal-type span').forEach(span => {
      span.style.display = 'none';
    });
  });
}

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
        delay: 0.6,
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

    // Only trigger on left mouse button (button === 0)
    const handleHeroImageMouseDown = (e) => {
      if (e.button !== 0) return;
      handleHeroImageClick();
    };

    heroImages.forEach((img) => {
      img.addEventListener("mousedown", handleHeroImageMouseDown);
    });
  }

  // --- GSAP ScrollTrigger Animations ---
  document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    const splitTypes = document.querySelectorAll('.reveal-type');
    let mainTimeline = gsap.timeline();

    // Detect if screen width is <= 1440px
    const isSmallScreen = window.innerWidth <= 1440;

    // Adjust blur values based on screen size
    const blurStart = isSmallScreen ? "blur(2px)" : "blur(4px)";
    const blurEnd = isSmallScreen ? "blur(0.2px)" : "blur(0.5px)";

    // Text reveal animation
    splitTypes.forEach((el, i) => {
        const split = new SplitType(el, { types: 'words' });

        split.words.forEach((word, idx) => {
            word.style.display = 'inline-block';
            if (idx < split.words.length - 1) {
                const space = document.createTextNode(' ');
                word.parentNode.insertBefore(space, word.nextSibling);
            }
        });

        gsap.set(split.words, { opacity: 0.5, filter: blurStart });

        mainTimeline.fromTo(
            split.words,
            { opacity: 0.5, filter: blurStart },
            { 
                opacity: 1, 
                filter: blurEnd, 
                duration: 1.5,
                stagger: 0.2,
                ease: 'power3.out' 
            },
            i === 0 ? 0 : '>'
        );
    });

    // Main text reveal ScrollTrigger
    if (splitTypes.length > 0) {
      ScrollTrigger.create({
          trigger: splitTypes[0],
          start: 'top 60%',
          end: '200% 20%',
          scrub: 1,
          animation: mainTimeline,
          toggleActions: 'play play reverse reverse'
      });
    }

    // Helper function to check if element is past trigger point and should animate
    function checkAndTriggerAnimation(container, animation, startPosition) {
        // Parse the start position (e.g., "center 70%" or "bottom 57.95%")
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        let triggerPoint;
        if (startPosition.includes('center')) {
            const percentage = parseFloat(startPosition.split(' ')[1]) / 100;
            const elementCenter = rect.top + (rect.height / 2);
            triggerPoint = windowHeight * percentage;
            if (elementCenter < triggerPoint) {
                animation.play();
            }
        } else if (startPosition.includes('bottom')) {
            const percentage = parseFloat(startPosition.split(' ')[1]) / 100;
            triggerPoint = windowHeight * percentage;
            if (rect.bottom < triggerPoint) {
                animation.play();
            }
        }
    }
    
    // Alternative: Force check all animations after page load
    function forceCheckAllAnimations() {
        // Check team members
        teamMemberSpans.forEach((container, index) => {
            const imgWrapper = container.querySelector('span');
            if (imgWrapper) {
                const rect = container.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // If element is above the 60% mark, trigger animation
                if (rect.bottom < windowHeight * 0.6) {
                    const teamRevealTL = gsap.timeline();
                    teamRevealTL
                        .to(imgWrapper, {
                            width: 180,
                            opacity: 1,
                            scale: 1,
                            duration: 0.25,
                            ease: "power2.out"
                        })
                        .to(imgWrapper.querySelectorAll('img'), {
                            scale: 1,
                            opacity: 1,
                            duration: 0.25,
                            ease: "power2.out",
                            stagger: 0.08
                        }, '-=0.18');
                }
            }
        });
        
        // Check lottie containers
        animeContainers.forEach((container, index) => {
            const lottie = container.querySelector('dotlottie-player');
            const img = container.querySelectorAll('img');
            let target = lottie || img;
            
            if (container && target) {
                const rect = container.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Get the specific trigger point for this lottie
                const lottieScrollPositions = [
                    { start: 'center 71%', end: 'center 60%' },
                    { start: 'center 70%', end: 'center 60%' },
                    { start: 'center 69.8%', end: 'center 60%' },
                    { start: 'center 69%', end: 'center 60%' },
                    { start: 'center 78%', end: 'center 60%' },
                    { start: 'center 88%', end: 'center 60%' },
                    { start: 'center 93%', end: 'center 60%' }
                ];
                
                const position = lottieScrollPositions[index] || { start: 'center 70%' };
                const percentage = parseFloat(position.start.split(' ')[1]) / 100;
                const elementCenter = rect.top + (rect.height / 2);
                const triggerPoint = windowHeight * percentage;
                
                if (elementCenter < triggerPoint) {
                    const animeRevealTL = gsap.timeline();
                    animeRevealTL
                        .to(container, {
                            width: lottie ? 100 : 64,
                            opacity: 1,
                            scale: 1,
                            duration: 0.2,
                            ease: "power2.out"
                        })
                        .to(target, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.2,
                            ease: "power2.out",
                            onStart: () => {
                                if (lottie && typeof lottie.play === "function") {
                                    lottie.play();
                                }
                            }
                        }, '-=0.15');
                }
            }
        });
    }

    // Team member animations
    const teamMemberSpans = document.querySelectorAll('.team-member');
    teamMemberSpans.forEach((container, index) => {
        const imgWrapper = container.querySelector('span');
        if (imgWrapper) {
            const imgs = imgWrapper.querySelectorAll('img');
            if (imgs.length > 0) {
                // Set initial state for container and images
                gsap.set(imgWrapper, { width: 0, opacity: 0, scale: 0 });
                gsap.set(imgs, { scale: 0, opacity: 0, transformOrigin: 'center center' });

                // Create timeline for reveal
                const teamRevealTL = gsap.timeline({ paused: true });
                teamRevealTL
                    .to(imgWrapper, {
                        width: 180,
                        opacity: 1,
                        scale: 1,
                        duration: 0.25,
                        ease: "power2.out"
                    })
                    .to(imgs, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.25,
                        ease: "power2.out",
                        stagger: 0.08
                    }, '-=0.18');

                // ScrollTrigger for each .team-member
                ScrollTrigger.create({
                    trigger: container,
                    start: 'bottom 57.95%',
                    end: 'center 60%',
                    animation: teamRevealTL,
                    toggleActions: 'play none none reverse',
                    id: `team-member-${index}`,
                    refreshPriority: -1
                });

                // Check if we should trigger immediately on load
                checkAndTriggerAnimation(container, teamRevealTL, 'bottom 57.95%');
            }
        }
    });

    // Lottie container animations
    const animeContainers = document.querySelectorAll('.lottie-container');
    
    animeContainers.forEach((container, index) => {
        const lottie = container.querySelector('dotlottie-player');
        const img = container.querySelectorAll('img');
        let target = lottie || img;

        if (container && target) {
            // Set initial states
            gsap.set(container, { width: 0, opacity: 0, scale: 0 });
            gsap.set(target, { scale: 0, opacity: 0, transformOrigin: 'center center' });

            // Create timeline for reveal
            const animeRevealTL = gsap.timeline({ paused: true });
            animeRevealTL
                .to(container, {
                    width: lottie ? 100 : 64,
                    opacity: 1,
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                })
                .to(target, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                    onStart: () => {
                        if (lottie && typeof lottie.play === "function") {
                            lottie.play();
                        }
                    }
                }, '-=0.15');

            // Custom start/end positions for each lottie
            const lottieScrollPositions = [
                { start: 'center 71%', end: 'center 60%' },
                { start: 'center 70%', end: 'center 60%' },
                { start: 'center 69.8%', end: 'center 60%' },
                { start: 'center 69%', end: 'center 60%' },
                { start: 'center 78%', end: 'center 60%' },
                { start: 'center 88%', end: 'center 60%' },
                { start: 'center 93%', end: 'center 60%' }
            ];

            // ScrollTrigger for each container
            ScrollTrigger.create({
                trigger: container,
                start: lottieScrollPositions[index] ? lottieScrollPositions[index].start : 'center 70%',
                end: lottieScrollPositions[index] ? lottieScrollPositions[index].end : 'center 60%',
                animation: animeRevealTL,
                toggleActions: 'play none none reverse',
                id: `anime-lottie-${index}`,
                refreshPriority: -1,
                onEnter: () => {
                    // Animation will be handled by the timeline
                },
                onLeaveBack: () => {
                    if (lottie && typeof lottie.stop === "function") {
                        lottie.stop();
                    }
                }
            });

            // Check if we should trigger immediately on load
            const startPos = lottieScrollPositions[index] ? lottieScrollPositions[index].start : 'center 70%';
            checkAndTriggerAnimation(container, animeRevealTL, startPos);
        }
    });

    // Force check all animations on page load
    setTimeout(() => {
        ScrollTrigger.refresh();
        // Run the force check after ScrollTrigger is ready
        setTimeout(() => {
            forceCheckAllAnimations();
        }, 200);
    }, 100);

    // Handle page visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });

  }); // End of DOMContentLoaded

} // End of animationsAllowed block

// --- Project Image Switcher (Always runs, outside animation block) ---
document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll(".project");

    const imageSources = [
        { before: "qw-before.webp", after: "qw.webp" },
        { before: "coral-before.webp", after: "coral.webp" },
        { before: "pb-before.webp", after: "pb.webp" },
        { before: "kati-before.webp", after: "kati.webp" },
        { before: "sara-before.webp", after: "sara.webp" },
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

        if (!beforeBtn || !afterBtn || !img || !imageSources[index]) return;

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

        const setImage = (type) => {
            const filename = imageSources[index][type];
            img.style.opacity = 0;

            img.src = `${baseURL}${filename}?tr=w-800,f-webp`;
            img.srcset = buildSrcset(filename);
            img.sizes = sizes;
            img.loading = "lazy";
            img.decoding = "async";
            img.fetchPriority = "low";

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

        // Initialize with after image
        setImage("after");
    });
});