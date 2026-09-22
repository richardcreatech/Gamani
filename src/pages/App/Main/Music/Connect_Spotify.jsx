function Connect_Spotify() {
  const connectSpotify = () => {
    window.location.href = "http://127.0.0.1:3000/auth/spotify";
  };

  return (
    <main className="spotify-page">

      <div className="spotify-page__cloud cloud-one"></div>
      <div className="spotify-page__cloud cloud-two"></div>

      <div className="spotify-mascot">
        <div className="mascot__body">
          <div className="mascot__eye mascot__eye--left"></div>
          <div className="mascot__eye mascot__eye--right"></div>

          <div className="mascot__mouth">
            u
          </div>
        </div>

        <div className="mascot__arm mascot__arm--left"></div>
        <div className="mascot__arm mascot__arm--right"></div>

        <div className="music-note music-note--one">♪</div>
        <div className="music-note music-note--two">♫</div>
      </div>

      <section className="spotify-card">

        <div className="spotify-card__label">
          <span></span>
          GAMANI
        </div>

        <p className="spotify-card__eyebrow">
          OH, HELLO THERE
        </p>

        <h1>
          Let's get your
          <span>music.</span>
        </h1>

        <p className="spotify-card__description">
          Connect your Spotify account and let your music
          come hang out with us.
        </p>

        <button
          className="spotify-card__button"
          onClick={connectSpotify}
        >
          <span className="spotify-card__button-icon">♪</span>

          Connect Spotify

          <span className="spotify-card__button-arrow">
            →
          </span>
        </button>

        <p className="spotify-card__note">
          We'll send you over to Spotify for this bit.
        </p>

      </section>

      <p className="spotify-page__footer">
        music makes things less weird
      </p>

    </main>
  );
}

export default Connect_Spotify;