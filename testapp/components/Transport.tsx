import React from 'react';
import { ActionTypes } from '../../src/state';
import { PlayStates, MultitrekState } from '../../src/types';


interface ControlsProps {
  playState: PlayStates;
  play: (e: Event) => void;
  stop: (e: Event) => void;
  pause: (e: Event) => void;
  maxTrackLength: number;
  maxTrackDuration: number;
  multitrekState: MultitrekState;
  dispatch: (action: any) => any;
}

function Controls(props: ControlsProps) {
  const { playState, play, stop, pause, multitrekState, maxTrackDuration, dispatch } = props;
  const { currentTime } = multitrekState;
  const { tracks } = multitrekState;
  const playheadPosition = currentTime / maxTrackDuration * 100;
  const disableStop = [PlayStates.Playing, PlayStates.Unstarted].includes(playState);

  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [shouldCursorDisplay, setShouldCursorDisplay] = React.useState(false);

  const handleMouseOver = () => setShouldCursorDisplay(true);
  const handleMouseLeave = () => setShouldCursorDisplay(false);
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX } = e;
    const { left } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCursorPosition(clientX - left);
  };
  const handleClick = (e: MouseEvent) => {
    const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dispatch({ type: ActionTypes.Seek, payload: (e.clientX - left) / width * maxTrackDuration });
  };

  const toggle = () => {
    const soloed = tracks.find((t) => t.solo);
    const soloedIdx = tracks.indexOf(soloed);
    const toSolo = soloedIdx === tracks.length - 1
      ? tracks[0]
      : tracks.find((t, i) => !t.solo && (i > soloedIdx));

    tracks.forEach((t) => {
      dispatch({
        type: t === toSolo ? ActionTypes.Solo : ActionTypes.Unsolo,
        payload: t.key,
      });
    });
  };

  return (
    <div className='multitrek__transport'>
      <div className='multitrek__controls'>
        {
          playState === PlayStates.Playing
            ? <button className='multitrek__control multitrek__play' onClick={pause}>
                <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
                  <rect x='20' y='5' width='20' height='95' />
                  <rect x='60' y='5' width='20' height='95' />
                </svg>
              </button>
            : <button className='multitrek__control multitrek__play' onClick={play}>
                <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
                  <path d='M 20 0 L 95 50 L 20 100 Z' />
                </svg>
              </button>
        }
        <button className='multitrek__control multitrek__stop' onClick={stop} disabled={disableStop}>
          <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
            <rect x='10' y='10' width='80' height='80' />
          </svg>
        </button>
        {/* <button onClick={toggle}>toggle soloed</button> */}

        <div className='multitrek__ab'>

        </div>
        {/* <svg
          className='multitrek__knob'
          width='1600'
          height='800'
          viewBox='0 0 2000 1200'
          preserveAspectRatio='xMidYMin'
        >
          <defs>
            <filter id='top-knob-shadow'>
              <feDropShadow dx='10' dy='16' stdDeviation='12' floodColor='rgba(50, 50, 50, 0.5)' floodOpacity='0.2' />
            </filter>
            <filter id='knob-shadow'>
              <feDropShadow dx='16' dy='24' stdDeviation='20' floodColor='rgba(50, 50, 50, 0.9)' floodOpacity='0.3' />
            </filter>
            <linearGradient id='knob-gradient'>
              <stop offset='10%' stopColor='rgb(225, 220, 245)' />
              <stop offset='15%' stopColor='rgb(215, 219, 229)' />
              <stop offset='94%' stopColor='rgb(171, 169, 189)' />
              <stop offset='100%' stopColor='rgb(225, 220, 245)' />
            </linearGradient>
          </defs>
          <path
            stroke='rgb(141, 139, 149)'
            strokeWidth='10'
            fill='url(#knob-gradient)'
            d='M 680 600 L 690 760 A 320 300 180 0 0 1310 760 L 1320 600 Z'
            style={{ filter: 'url(#knob-shadow)' }}
          />
          <ellipse
            cx='1000'
            cy='600'
            rx='320'
            ry='300'
            stroke='rgb(185, 182, 188)'
            strokeWidth='10'
            fill='rgb(252, 249, 255)'
            style={{ filter: 'url(#top-knob-shadow)' }}
          />
        </svg> */}
      </div>

      <div
        className='multitrek__transport__hud'
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          className='multitrek__transport__playhead'
          style={{ left: `${playheadPosition}%` }}
        />

        {
          shouldCursorDisplay
            ? <div className='multitrek__transport__cursor' style={{ left: cursorPosition }} />
            : null
        }
      </div>
    </div>
  );
}

export default Controls;
