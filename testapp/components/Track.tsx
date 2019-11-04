import React from 'react';
import cn from 'classnames';
import PlayStates from '../../src/types/PlayStates';
import { useTrackState } from '../../src';
import { TrackState, TrackMetaState } from '../../src/types/TrackState';
import Waveform from '../../src/Waveform';


interface TrackProps {
  bins: PowerOf2;
  source: string;
  isSoloOn: boolean;
  isComplete: boolean;
  seekPosition: number;
  meta: TrackMetaState;
  context: AudioContext;
  playState: PlayStates;
  onMute: () => void;
  onUnmute: () => void;
  onSolo: () => void;
  onUnsolo: () => void;
  onComplete: () => void;
  setTime: (audio: any) => void;
}


function Track(props: TrackProps) {
  const { source } = props;
  const {
    meta,
    shouldMakeNoise,
    multitrekContext,
  } = useTrackState({ source });
  const { state } = multitrekContext;
  const { playState } = state;


  // wait for audio to load
  if (meta == null) {
    return (
      <div className={cn('multitrek__track', 'multitrek__track--compare', 'multitrek__track--loading')}>
        <p>loading</p>
      </div>
    );
  }

  return (
    <div
      className={cn('multitrek__track', 'multitrek__track--compare', { 'multitrek__track--muted': !shouldMakeNoise })}
    >
      <Waveform
        rms={meta.rms}
        muted={!shouldMakeNoise}
        playState={playState}
        normalize
      />
    </div>
  );
}

export default Track;
