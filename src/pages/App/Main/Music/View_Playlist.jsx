function View_Playlist() {
  return (
    <section id="view_playlist_page">

      <div className="scrapbook">

        {/* =========================
            LEFT PAGE
        ========================= */}

        <section id="current_playlist">

          <div className="playlist_picture">
            <img
              src="/playlist-cover.jpg"
              alt="Playlist cover"
            />
          </div>

          <div className="playlist_details">
            <span className="playlist_label">
              PLAYLIST
            </span>

            <h1>Late Night Thoughts</h1>

            <p className="playlist_description">
              Songs for when the world gets a little quieter.
            </p>

            <div className="playlist_meta">
              <span>12 songs</span>
              <span>Made with Gamani</span>
            </div>
          </div>

        </section>


        {/* =========================
            RIGHT PAGE
        ========================= */}

        <section id="songs_in_playlist">

          <header className="playlist_songs_header">
            <span>TRACKS</span>
            <h2>Inside this playlist</h2>
          </header>

          <div className="playlist_song_list">

            <button className="playlist_song">
              <span className="song_number">01</span>

              <img
                src="/album.jpg"
                alt=""
              />

              <div className="playlist_song_info">
                <strong>Nights</strong>
                <span>Frank Ocean</span>
              </div>
            </button>


            <button className="playlist_song">
              <span className="song_number">02</span>

              <img
                src="/album.jpg"
                alt=""
              />

              <div className="playlist_song_info">
                <strong>Pink + White</strong>
                <span>Frank Ocean</span>
              </div>
            </button>


            <button className="playlist_song">
              <span className="song_number">03</span>

              <img
                src="/album.jpg"
                alt=""
              />

              <div className="playlist_song_info">
                <strong>Self Control</strong>
                <span>Frank Ocean</span>
              </div>
            </button>

          </div>

        </section>

      </div>

    </section>
  );
}

export default View_Playlist;