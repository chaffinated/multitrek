import React from 'react';
import { render } from 'react-dom';
import Multitrek from '../src/Multitrek.tsx';
import Transport from './components/Transport.tsx';
import Track from './components/Track.tsx';
// import handingOn from './audio/hanging-on.mp3';
// import timeTraveler from './audio/time-traveler.mp3';
import './index.scss';

// import * as tracks from './audio/multi/*.mp3';
import * as mastered from './audio/mastered/*.mp3';

// const sources = Object.values(tracks).filter((s) => typeof s === 'string');
const masteredSources = Object.values(mastered).filter((s) => typeof s === 'string');

function App() {
  return (
    <div className="screen-wrap">
      <Multitrek
        controls={Transport}
        track={Track}
        sources={masteredSources}
      />
    </div>
  );
}

function init() {
  const root = document.getElementById('app');
  render(<App />, root);
}

document.addEventListener('DOMContentLoaded', init);
