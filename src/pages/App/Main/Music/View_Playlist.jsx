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
              src="https://i.pinimg.com/736x/74/9f/51/749f511267c72fe6a8888d8ce3a3f13f.jpg"
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
                src="https://i.pinimg.com/1200x/8d/b0/30/8db0303af3cb78ec446db8e2d1d477be.jpg"
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
                src="https://i.pinimg.com/736x/f3/16/46/f31646c66a2a8498017459f33407aec3.jpg"
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
                src="https://i.pinimg.com/736x/c2/4d/d7/c24dd7900961edd8d9bb506b70dff313.jpg"
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