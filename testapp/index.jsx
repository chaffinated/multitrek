import React from 'react';
import { render } from 'react-dom';
import Multitrek, { Track, Transport, RecordingTrack } from '../src';
// import Transport from './components/Transport.tsx';
// import Track from './components/Track.tsx';
// import handingOn from './audio/hanging-on.mp3';
// import timeTraveler from './audio/time-traveler.mp3';
// import './index.scss';

// import * as tracks from './audio/multi/*.mp3';
// import * as mastered from './audio/mastered/*.mp3';
import trackSource from './audio/hanging-on.mp3';

// const sources = Object.values(tracks).filter((s) => typeof s === 'string').slice(0, 8);
// const masteredSources = Object.values(mastered).filter((s) => typeof s === 'string');
// const masteredSources = Object.values(mastered).filter((s) => typeof s === 'string');

function App() {
  const handleFinishRecording = (blobUrl) => {
    window.open(blobUrl, '_blank');
  };

  return (
    <div className="screen-wrap">
      <Multitrek>
        <Transport />
        <div className='multitrek__tracks'>
          {/* {
            sources.map((source) => <Track key={source} source={source} normalize />)
          } */}
          <Track
            key={trackSource}
            source={trackSource}
            normalize
          />
          <RecordingTrack onFinish={handleFinishRecording} />
        </div>
      </Multitrek>
    </div>
  );
}

function init() {
  const root = document.getElementById('app');
  render(<App />, root);
}

document.addEventListener('DOMContentLoaded', init);
