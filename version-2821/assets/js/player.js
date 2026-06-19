document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("video[data-play-url]");
  var overlay = document.querySelector(".play-overlay");
  if (!video) return;
  var playUrl = video.getAttribute("data-play-url");
  var started = false;
  var hlsInstance = null;

  function attachAndPlay() {
    if (!playUrl) return;
    if (!started) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
      started = true;
    }
    if (overlay) overlay.classList.add("hidden");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", attachAndPlay);
  }
  video.addEventListener("click", function () {
    if (!started || video.paused) attachAndPlay();
  });
  video.addEventListener("play", function () {
    if (overlay) overlay.classList.add("hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) hlsInstance.destroy();
  });
});
