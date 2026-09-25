import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
// import spot_logo from "../                                                                                                                        "

function Listen() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progressMs, setProgressMs] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState([]);

  const BACKEND_URL = "http://127.0.0.1:3000";

  /* =========================
     GET CURRENT PLAYBACK
  ========================= */

  const getCurrentTrack = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playback/current`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get current song.");
      }

      setCurrentTrack(data.track);
      setIsPlaying(data.playing);
      setProgressMs(data.progressMs || 0);
    } catch (error) {
      console.error("Current playback error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getQueue = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playback/queue`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get queue.");
      }

      setQueue(data.songs);
    } catch (error) {
      console.error("Queue error:", error);
    }
  };

  /* =========================
     LOAD CURRENT SONG
  ========================= */
  useEffect(() => {
    getCurrentTrack();
    getQueue();

    const interval = setInterval(() => {
      getCurrentTrack();
      getQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     NEXT
  ========================= */
  const nextSong = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playback/next`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to play next song.");
      }

      setTimeout(() => {
        getCurrentTrack();
        getQueue();
      }, 500);
    } catch (error) {
      console.error("Next song error:", error);
    }
  };

  /* =========================
     PREVIOUS
  ========================= */
  const previousSong = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playback/previous`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to play previous song.");
      }

      setTimeout(() => {
        getCurrentTrack();
        getQueue();
      }, 500);
    } catch (error) {
      console.error("Previous song error:", error);
    }
  };

  /* =========================
     SEEK
  ========================= */

  const seekSong = async (event) => {
    if (!currentTrack) return;

    const progressBar = event.currentTarget;

    const rect = progressBar.getBoundingClientRect();

    const clickPosition = event.clientX - rect.left;

    const percentage = Math.min(Math.max(clickPosition / rect.width, 0), 1);

    const newPosition = percentage * currentTrack.durationMs;

    setProgressMs(newPosition);

    try {
      await fetch(`${BACKEND_URL}/playback/seek`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          positionMs: newPosition,
        }),
      });
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  /* =========================
     MUTE
  ========================= */

  const muteSong = async () => {
    try {
      await fetch(`${BACKEND_URL}/playback/mute`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (error) {
      console.error("Mute error:", error);
    }
  };

  const playQueueSong = async (uri) => {
    try {
      const response = await fetch(`${BACKEND_URL}/playback/queue/play`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uri,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Unable to play queue song.");
      }

      setTimeout(() => {
        getCurrentTrack();
        getQueue();
      }, 500);
    } catch (error) {
      console.error("Play queue song error:", error);
    }
  };

  /* =========================
     FORMAT TIME
  ========================= */

  const formatTime = (milliseconds = 0) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <section id="listen_page">
        <p>Getting your music...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="listen_page">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section id="listen_page">
      <div className="player-area">
        <div className="gamepad">
          {/* =========================
              SCREEN
          ========================= */}

          <div className="gamepad-screen">
            {currentTrack ? (
              <>
                <img src={currentTrack.albumCover} alt={currentTrack.album} />

                <div className="screen-song">
                  <strong>{currentTrack.name}</strong>

                  <span>
                    {currentTrack.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                  </span>
                </div>
              </>
            ) : (
              <div className="screen-song">
                <strong>Nothing playing</strong>
                <span>Go find something nice.</span>
              </div>
            )}
          </div>

          {/* =========================
              CONTROLS
          ========================= */}

          <div className="gamepad-controls">
            <button
              className="skip-button previous-button"
              onClick={previousSong}
            >
              <FontAwesomeIcon icon={faBackwardStep} />
            </button>

            {/* Leave play/pause for the
                separate playback toggle controller */}

            <button className="play-button" disabled>
              <span>{isPlaying ? "Ⅱ" : "▶"}</span>
            </button>

            <button className="skip-button next-button" onClick={nextSong}>
              <FontAwesomeIcon icon={faForwardStep} />
            </button>
          </div>

          {/* =========================
              PROGRESS
          ========================= */}

          <div className="music-progress">
            <span className="progress-time">{formatTime(progressMs)}</span>

            <div className="squiggly-progress" onClick={seekSong}>
              <div
                className="progress-fill"
                style={{
                  width: currentTrack?.durationMs
                    ? `${(progressMs / currentTrack.durationMs) * 100}%`
                    : "0%",
                }}
              />

              <div
                className="progress-knob"
                style={{
                  left: currentTrack?.durationMs
                    ? `${(progressMs / currentTrack.durationMs) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <span className="progress-time">
              {formatTime(currentTrack?.durationMs || 0)}
            </span>
          </div>

          {/* =========================
              BOTTOM CONTROLS
          ========================= */}

          <div className="gamepad-bottom">
            <button onClick={muteSong}>
              <FontAwesomeIcon icon={faVolumeHigh} />
            </button>

            <span>{isPlaying ? "NOW PLAYING" : "PAUSED"}</span>
          </div>
        </div>

        {/* =========================
            QUEUE
        ========================= */}
        <aside className="listen-queue">
          <div className="queue-heading">
            <span>NEXT UP</span>
            <h2>What's coming?</h2>
          </div>

          {queue.map((song) => (
            <button
              key={song.id}
              className="queue-song"
              onClick={() => playQueueSong(song.uri)}
            >
              <img src={song.albumCover} alt={song.album} />

              <span>
                <strong>{song.name}</strong>
                <small>{song.artist}</small>
              </span>
            </button>
          ))}

          {queue.length === 0 && (
            <p className="empty-queue">Nothing waiting yet.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default Listen;
