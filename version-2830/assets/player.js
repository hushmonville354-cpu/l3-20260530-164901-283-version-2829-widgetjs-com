(function () {
  let hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoader) {
      hlsLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.7/dist/hls.min.js';
        script.onload = () => resolve(window.Hls);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsLoader;
  }

  window.mountMoviePlayer = function (streamUrl) {
    const video = document.querySelector('#movie-video');
    const cover = document.querySelector('#player-cover');
    const trigger = document.querySelector('#play-trigger');

    if (!video || !cover || !trigger || !streamUrl) {
      return;
    }

    let attached = false;

    async function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      try {
        const Hls = await loadHls();

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          return;
        }
      } catch (error) {
        attached = false;
      }

      video.src = streamUrl;
    }

    async function play() {
      await attach();
      cover.classList.add('is-hidden');
      video.controls = true;

      try {
        await video.play();
      } catch (error) {
        cover.classList.remove('is-hidden');
      }
    }

    cover.addEventListener('click', play);
    trigger.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
  };
}());
