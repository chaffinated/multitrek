import React from 'react';
import { ActionTypes } from '../../src/state';
import { PlayStates, MultitrekState } from '../../src/types';


interface ControlsProps {
  playState: PlayStates;
  play: (e: Event) => void;
  stop: (e: Event) => void;
  pause: (e: Event) => void;
  multitrekState: MultitrekState;
  dispatch: (action: any) => any;
}

function Controls(props: ControlsProps) {
  const { playState, play, stop, pause, multitrekState, dispatch } = props;
  const disableStop = [PlayStates.Playing, PlayStates.Unstarted].includes(playState);

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
      {
        playState === PlayStates.Playing
        ? <button onClick={pause}>pause</button>
        : <button onClick={play}>play</button>
      }
      <button onClick={stop} disabled={disableStop}>stop</button>
      <button onClick={toggle}>toggle soloed</button>
    </div>
  );
}

export default Controls;
