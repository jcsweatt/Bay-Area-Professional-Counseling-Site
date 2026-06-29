(function () {
  function siteAsset(path) {
    var prefix = window.location.pathname.indexOf("/Bay-Area-Professional-Counseling-Site/") === 0
      ? "/Bay-Area-Professional-Counseling-Site"
      : "";
    return prefix + path;
  }

  function previewPath(path) {
    var prefix = window.location.pathname.indexOf("/Bay-Area-Professional-Counseling-Site/") === 0
      ? "/Bay-Area-Professional-Counseling-Site"
      : "";
    return prefix + "/quiet-coast/" + path.replace(/^\/+/, "");
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionTargets = document.querySelectorAll(".about-arrival-map, .about-constellation");
  var scrollTargets = [];
  var ticking = false;

  function reveal(target) {
    target.classList.add("is-visible");
    if (!reduceMotion) {
      window.setTimeout(function () {
        target.classList.add("is-scroll-linked");
        if (scrollTargets.indexOf(target) === -1) {
          scrollTargets.push(target);
        }
        requestScrollUpdate();
      }, 2400);
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateLineScroll() {
    ticking = false;

    scrollTargets.forEach(function (target) {
      var rect = target.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var travel = viewportHeight + rect.height;
      var progress = clamp((viewportHeight - rect.top) / travel, 0, 1);
      var offset = 120 - (progress * 240);

      target.style.setProperty("--about-line-scroll-offset", offset.toFixed(2));
    });
  }

  function requestScrollUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateLineScroll);
    }
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    motionTargets.forEach(reveal);
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.32
    });

    motionTargets.forEach(function (target) {
      observer.observe(target);
    });
  }

  if (!reduceMotion) {
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
  }

  var therapists = [
    {
      href: previewPath("alexa/"),
      image: siteAsset("/assets/IMG_9906-e7cd05e5faf2.jpg"),
      alt: "Alexa Da Rosa",
      name: "Alexa",
      note: "Addiction, transitions, LGBTQ+ concerns"
    },
    {
      href: previewPath("lacey/"),
      image: siteAsset("/assets/IMG_0051-99db6be59a41.jpg"),
      alt: "Lacey Moore",
      name: "Lacey",
      note: "Trauma, ADHD, supervision, family relations"
    },
    {
      href: previewPath("cindy/"),
      image: siteAsset("/assets/IMG_0006-2-1fecee2be4a7.jpg"),
      alt: "Cindy Perronne",
      name: "Cindy",
      note: "Adults, couples, adolescents, experience"
    },
    {
      href: previewPath("virginia/"),
      image: siteAsset("/assets/IMG_0032-6ebb79567067.jpg"),
      alt: "Virginia Inge Gordon",
      name: "Virginia",
      note: "Parenting, grief, trauma, infertility support"
    },
    {
      href: previewPath("lanya/"),
      image: siteAsset("/assets/lanya-daffin-headshot.jpg"),
      alt: "Lanya Daffin",
      name: "Lanya",
      note: "Client-centered support and life change"
    },
    {
      href: previewPath("kayla/"),
      image: siteAsset("/assets/Kayla-pic-ef9bd584ab26.jpg"),
      alt: "Kayla Whatley",
      name: "Kayla",
      note: "Children, families, trauma, anxiety, ADHD"
    },
    {
      href: previewPath("leigh/"),
      image: siteAsset("/assets/L.photo-b9534d3c0366.jpg"),
      alt: "Leigh Mohorn",
      name: "Leigh",
      note: "Perinatal care, grief, infertility, trauma"
    },
    {
      href: previewPath("deena/"),
      image: siteAsset("/assets/d.picture-8591aaa80845.jpg"),
      alt: "Deena Alloul",
      name: "Deena",
      note: "ADHD, anxiety, inclusion, next steps"
    },
    {
      href: previewPath("tifani/"),
      image: siteAsset("/assets/Tif-pic-3-b87dc034dccb.jpg"),
      alt: "Tifani Nobles",
      name: "Tifani",
      note: "Anxiety, grief, family change, stress"
    },
    {
      href: previewPath("madison/"),
      image: siteAsset("/assets/Madison-Pic-a91fa98fbe07.jpg"),
      alt: "Madison Ford",
      name: "Madison",
      note: "Children, autism spectrum, grief, trauma"
    }
  ];

  var slots = document.querySelectorAll("[data-about-therapist]");
  if (!slots.length) {
    return;
  }

  var start = Math.floor(Math.random() * therapists.length);
  try {
    var previousStart = sessionStorage.getItem("aboutTherapistStart");
    if (therapists.length > 1 && previousStart !== null && Number(previousStart) === start) {
      start = (start + 1) % therapists.length;
    }
    sessionStorage.setItem("aboutTherapistStart", String(start));
  } catch (error) {
    // The random fallback above is enough when session storage is unavailable.
  }

  var rotated = therapists.slice(start).concat(therapists.slice(0, start));

  slots.forEach(function (slot, index) {
    var therapist = rotated[index % rotated.length];
    var image = slot.querySelector("img");
    var name = slot.querySelector("span");
    var note = slot.querySelector("small");

    slot.setAttribute("href", therapist.href);
    slot.setAttribute("aria-label", "View " + therapist.alt + "'s profile");

    if (image) {
      image.setAttribute("src", therapist.image);
      image.setAttribute("alt", therapist.alt);
    }

    if (name) {
      name.textContent = therapist.name;
    }

    if (note) {
      note.textContent = therapist.note;
    }
  });
})();
