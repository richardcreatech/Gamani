import {
  faBackwardStep,
  faForwardStep,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Listen() {
  return (
    <section id="listen_page">
      {/* =========================
          PLAYER AREA
      ========================= */}

      <div className="player-area">
        <div className="gamepad">
          {/* Screen */}
          <div className="gamepad-screen">
            <img
              src="https://i.pinimg.com/1200x/55/a0/6d/55a06df6a3fa3004d1b2edd8986b8248.jpg"
              alt="Currently playing album"
            />

            <div className="screen-song">
              <strong>Nights</strong>
              <span>Frank Ocean</span>
            </div>
          </div>

          {/* Controls */}
          <div className="gamepad-controls">
            {/* Left control */}
            <button className="skip-button previous-button">
              <FontAwesomeIcon icon={faBackwardStep} />
            </button>

            {/* Main play button */}
            <button className="play-button">
              <span>▶</span>
            </button>

            {/* Right control */}
            <button className="skip-button next-button">
              <FontAwesomeIcon icon={faForwardStep} />
            </button>
          </div>

          {/* Squiggly progress */}
          <div className="music-progress">
            <span className="progress-time">1:24</span>

            <div className="squiggly-progress">
              <div className="progress-fill"></div>
              <div className="progress-knob"></div>
            </div>

            <span className="progress-time">4:12</span>
          </div>

          {/* Small bottom controls */}
          <div className="gamepad-bottom">
            <button>
              <FontAwesomeIcon icon={faVolumeHigh} />
            </button>

            <span>NOW PLAYING</span>
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

          <button className="queue-song">
            <img src="https://i.pinimg.com/736x/67/50/c0/6750c025c1b1cea3efd36cffd938cbb1.jpg" alt="" />

            <span>
              <strong>Pink + White</strong>
              <small>Frank Ocean</small>
            </span>
          </button>

          <button className="queue-song">
            <img src="https://i.pinimg.com/1200x/67/e8/40/67e8405bba39af3b106a93d7570b7930.jpg" alt="" />


            <span>
              <strong>Lost</strong>
              <small>Frank Ocean</small>
            </span>
          </button>

          <button className="queue-song">
            <img src="https://i.pinimg.com/736x/3a/ba/9b/3aba9b0e2538fbbd122121a2ea809f48.jpg" alt="" />

            <span>
              <strong>Self Control</strong>
              <small>Frank Ocean</small>
            </span>
          </button>
        </aside>
      </div>
    </section>
  );
}

export default Listen;
