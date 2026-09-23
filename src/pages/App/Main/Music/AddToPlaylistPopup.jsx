import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";

function AddToPlaylistPopup() {
  const playlists = [
    {
      id: 1,
      name: "Late Night Thoughts",
      songs: 12,
      cover: "/https://i.pinimg.com/736x/00/b5/dd/00b5dd3c625e0ebcdc3770e95162fe46.jpg",
    },
    {
      id: 2,
      name: "Getting Things Done",
      songs: 18,
      cover: "https://i.pinimg.com/736x/4e/ae/63/4eae638a97a66fcd5a22c172a94186c8.jpg",
    },
    {
      id: 3,
      name: "My Favorites",
      songs: 42,
      cover: "https://i.pinimg.com/736x/99/d9/5b/99d95bb1c81bf0e2b6a7a23d2ec19147.jpg",
    },
  ];

  return (
    <div id="add_playlist_overlay">
      <section id="add_playlist_popup">
        {/* Close */}
        <button className="close_playlist_popup" aria-label="Close">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Heading */}
        <div className="add_playlist_header">
          <p>ADD TO PLAYLIST</p>

          <h2>Where should this one go?</h2>

          <span>
            Adding <strong>Nights</strong> by 24kGoldn
          </span>
        </div>

        {/* Playlists */}
        <div className="popup_playlist_list">
          {playlists.map((playlist) => (
            <button className="popup_playlist" key={playlist.id}>
              <div className="popup_playlist_cover">
                <img src={playlist.cover} alt="" />

                <span className="popup_playlist_add">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </div>

              <div className="popup_playlist_info">
                <strong>{playlist.name}</strong>
                <small>{playlist.songs} songs</small>
              </div>
            </button>
          ))}
        </div>

        {/* Create playlist */}
        <button className="create_playlist_button">
          <FontAwesomeIcon icon={faPlus} />
          Create a new playlist
        </button>
      </section>
    </div>
  );
}

export default AddToPlaylistPopup;
