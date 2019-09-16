import React from 'react';
import { render } from 'react-dom';
import Multitrek from '../src/Multitrek.tsx';
import softEyesSrc from './audio/dandan-noodles-soft-eyes.mp3';
import gardyLooSrc from './audio/dandan-noodles-gardyloo.mp3';
import './index.scss';

function App() {
  return (
    <div className="screen-wrap">
      <Multitrek sources={[softEyesSrc, gardyLooSrc]} />
    </div>
  );
}

function init() {
  const root = document.getElementById('app');
  render(<App />, root);
}

document.addEventListener('DOMContentLoaded', init);
