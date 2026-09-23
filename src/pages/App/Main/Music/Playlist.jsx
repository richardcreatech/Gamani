function Playlist() {
  return (
    <section id="spotify_playlist">

      <header className="playlist-header">
        <div>
          <p className="playlist-eyebrow">YOUR MUSIC</p>
          <h1>Your playlists.</h1>
          <p>
            The music you've collected, discovered, and made along the way.
          </p>
        </div>
      </header>


      {/* Playlists created through Gamani */}
      <section className="playlist-section">
        <div className="playlist-section-header">
          <div>
            <span>MADE WITH GAMANI</span>
            <h2>Our little creations.</h2>
          </div>

          <span className="playlist-count">3 playlists</span>
        </div>

        <div className="playlist-list">

          <article className="playlist-item">
            <div className="playlist-cover">
              <img
                src="https://i.pinimg.com/1200x/e6/8f/08/e68f081d9702926e05bd3e7917b3a11e.jpg"
                alt="Playlist cover"
              />
            </div>

            <div className="playlist-info">
              <h3>Late Night Thoughts</h3>
              <span>12 songs</span>
            </div>
          </article>

          <article className="playlist-item">
            <div className="playlist-cover">
              <img
                src="https://i.pinimg.com/736x/34/5c/c3/345cc3a104d869e26573f9f152166050.jpg"
                alt="Playlist cover"
              />
            </div>

            <div className="playlist-info">
              <h3>Getting Things Done</h3>
              <span>18 songs</span>
            </div>
          </article>

        </div>
      </section>


      {/* Existing Spotify playlists */}
      <section className="playlist-section">
        <div className="playlist-section-header">
          <div>
            <span>FROM SPOTIFY</span>
            <h2>The rest of your collection.</h2>
          </div>

          <span className="playlist-count">8 playlists</span>
        </div>

        <div className="playlist-list">

          <article className="playlist-item">
            <div className="playlist-cover">
              <img
                src="https://i.pinimg.com/1200x/0d/3d/2f/0d3d2f3fe33f9fe594a4d9529e5d2de6.jpg"
                alt="Playlist cover"
              />
            </div>

            <div className="playlist-info">
              <h3>My Favorites</h3>
              <span>42 songs</span>
            </div>
          </article>

        </div>
      </section>

    </section>
  );
}

export default Playlist;