(function () {
  var gallery = document.querySelector("[data-gallery]");

  if (!gallery) {
    return;
  }

  var stops = Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-stop]"));
  var image = gallery.querySelector("[data-gallery-image]");
  var number = gallery.querySelector("[data-gallery-number]");
  var title = gallery.querySelector("[data-gallery-title]");
  var description = gallery.querySelector("[data-gallery-description]");
  var previousImages = gallery.querySelectorAll(".gallery-peek-previous img");
  var nextImages = gallery.querySelectorAll(".gallery-peek-next img");
  var path = gallery.querySelector(".gallery-path");
  var currentIndex = 0;

  function wrap(index) {
    return (index + stops.length) % stops.length;
  }

  function thumbnailSource(index) {
    return stops[wrap(index)].querySelector("img").src;
  }

  function show(index) {
    currentIndex = wrap(index);
    var stop = stops[currentIndex];

    image.classList.add("is-changing");
    image.src = stop.dataset.full;
    image.alt = stop.dataset.alt;
    image.style.objectPosition = stop.dataset.position || "center";
    number.textContent = String(currentIndex + 1).padStart(2, "0");
    title.textContent = stop.dataset.title;
    description.innerHTML = stop.dataset.caption;

    stops.forEach(function (item, itemIndex) {
      var selected = itemIndex === currentIndex;
      item.classList.toggle("is-selected", selected);
      if (selected) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    previousImages.forEach(function (preview) {
      preview.src = thumbnailSource(currentIndex - 1);
    });
    nextImages.forEach(function (preview) {
      preview.src = thumbnailSource(currentIndex + 1);
    });

    if (path.scrollWidth > path.clientWidth) {
      path.scrollTo({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        left: stop.offsetLeft - ((path.clientWidth - stop.offsetWidth) / 2)
      });
    }

    window.setTimeout(function () {
      image.classList.remove("is-changing");
    }, 40);
  }

  stops.forEach(function (stop, index) {
    stop.addEventListener("click", function () {
      show(index);
    });
  });

  gallery.querySelectorAll("[data-gallery-previous]").forEach(function (button) {
    button.addEventListener("click", function () {
      show(currentIndex - 1);
    });
  });

  gallery.querySelectorAll("[data-gallery-next]").forEach(function (button) {
    button.addEventListener("click", function () {
      show(currentIndex + 1);
    });
  });

  gallery.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(currentIndex + 1);
    }
  });
}());
