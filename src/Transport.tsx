import React, { useContext } from 'react';
import { PlayStates } from './types';
import MultitrekContext from './MultitrekContext';
import { ActionTypes } from './state';


function Controls() {
  const multitrekContext = useContext(MultitrekContext);
  const { state, play, pause, stop, dispatch, maxTrackDuration } = multitrekContext;
  const { playState, currentTime } = state;
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
