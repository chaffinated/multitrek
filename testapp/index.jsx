import React from 'react';
import { render } from 'react-dom';
import Multitrek from '../src/Multitrek.tsx';
import handingOn from './audio/hanging-on.mp3';
import timeTraveler from './audio/time-traveler.mp3';
import './index.scss';

function App() {
  return (
    <div className="screen-wrap">
      <Multitrek sources={[handingOn, timeTraveler]} />
    </div>
  );
}

function init() {
  const root = document.getElementById('app');
  render(<App />, root);
}

document.addEventListener('DOMContentLoaded', init);
