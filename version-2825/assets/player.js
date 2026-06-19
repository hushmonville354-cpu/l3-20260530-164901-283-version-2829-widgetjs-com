(function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-play-button]');
  var mask = document.querySelector('[data-player-mask]');
  var sourceNode = document.getElementById('player-source');

  if (!video || !button || !sourceNode) {
    return;
  }

  var payload = JSON.parse(sourceNode.textContent || '{}');
  var source = payload.src;
  var started = false;

  function bindSource() {
    if (started || !source) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function beginPlay() {
    bindSource();
    if (mask) {
      mask.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', beginPlay);
  if (mask) {
    mask.addEventListener('click', beginPlay);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlay();
    }
  });
})();
