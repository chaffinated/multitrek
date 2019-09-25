import React from 'react';
import { render } from 'react-dom';
import Multitrek from '../src/Multitrek.tsx';
// import handingOn from './audio/hanging-on.mp3';
// import timeTraveler from './audio/time-traveler.mp3';
import Snare from './audio/drums/snare.mp3';
import Tom from './audio/drums/tom.mp3';
import Hat from './audio/drums/hat.mp3';
import './index.scss';

function App() {
  return (
    <div className="screen-wrap">
      <Multitrek sources={[
          // handingOn,
          // timeTraveler,
          Snare,
          Tom,
          Hat,
        ]}
      />
    </div>
  );
}

function init() {
  const root = document.getElementById('app');
  render(<App />, root);
}

document.addEventListener('DOMContentLoaded', init);
