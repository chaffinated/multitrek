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
    const { tracks } = multitrekState;
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
            ? <button onClick={pause}>pause</button>
            : <button onClick={play}>play</button>
        }
        <button onClick={stop} disabled={disableStop}>stop</button>
        <button onClick={toggle}>toggle soloed</button>
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
