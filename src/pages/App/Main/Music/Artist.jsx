import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

function Artist() {
  return (
    <section id='artist_page'>
          <section id="the_arist">
              <img src="https://i.pinimg.com/1200x/2a/c5/90/2ac5904d0aefa63d7454c697f318ec79.jpg" alt="" />
              <span>@artist_name</span>
              <p className="about_artist">
                  24kGoldn is a Bay Area artist known for blending melodic rap, pop, and singing into a sound that moves easily between different moods. From “VALENTINO” to “Mood” and *El Dorado*, his music mixes catchy energy with a more personal and versatile side.

              </p>
          </section>
          <section id='artists_songs'>
              <article className="an_artists_song">
                <div className="song_cover">
                  <img src="https://i.pinimg.com/236x/9d/bd/af/9dbdaf7c90fc0702ced7bc412501bbac.jpg" alt="" />
                  </div>
                  <div className="song_info">
                      <h3 className="song_name">Song Name</h3>
                      <p className="song_something">Song Something</p>
                      <span className='add_to_playlist'><FontAwesomeIcon icon={faAdd} /></span>
                  </div>
              </article>
              <article className="an_artists_song">
                <div className="song_cover">
                  <img src="https://i.pinimg.com/736x/79/9e/05/799e0589d1a6f15b3a21347c4bdc4a79.jpg" alt="" />
                  </div>
                  <div className="song_info">
                      <h3 className="song_name">Song Name</h3>
                      <p className="song_something">Song Something</p>
                      <span className='add_to_playlist'><FontAwesomeIcon icon={faAdd} /></span>
                  </div>
              </article>
              <article className="an_artists_song">
                <div className="song_cover">
                  <img src="https://i.pinimg.com/736x/1b/f2/a1/1bf2a1ab9c9dcefab5a90b486d0852d5.jpg" alt="" />
                  </div>
                  <div className="song_info">
                      <h3 className="song_name">Song Name</h3>
                      <p className="song_something">Song Something</p>
                      <span className='add_to_playlist'><FontAwesomeIcon icon={faAdd} /></span>
                  </div>
              </article>
           
          </section>
    </section>
  )
}

export default Artist
