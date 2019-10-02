import React from 'react';
import { PlayStates, MultitrekState } from './types';
import { ActionTypes } from './state';


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
  const { playState, play, stop, pause, dispatch, maxTrackDuration, multitrekState } = props;
  const { currentTime } = multitrekState;
  const playheadPosition = currentTime / maxTrackDuration * 100;
  const disableStop = [PlayStates.Playing, PlayStates.Unstarted].includes(playState);

  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [shouldCursorDisplay, setShouldCursorDisplay] = React.useState(false);

  const handleMouseOver = () => setShouldCursorDisplay(true);
  const handleMouseLeave = () => setShouldCursorDisplay(false);
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX } = e;
    setCursorPosition(clientX);
  };
  const handleClick = (e: MouseEvent) => {
    const { width } = e.currentTarget.getBoundingClientRect();
    dispatch({ type: ActionTypes.Seek, payload: e.clientX / width * maxTrackDuration });
  };

  return (
    <div className='multitrek__transport'>
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

      <div className='multitrek__transport__controls'>
        {
          playState === PlayStates.Playing
          ? <button onClick={pause}>pause</button>
          : <button onClick={play}>play</button>
        }
        <button onClick={stop} disabled={disableStop}>stop</button>
      </div>
    </div>
  );
}

export default Controls;
