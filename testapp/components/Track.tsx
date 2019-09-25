import React from 'react';
import cn from 'classnames';
import PlayStates from '../../src/types/PlayStates';
import { TrackState, TrackMetaState } from '../../src/types/TrackState';
import Waveform from '../../src/Waveform';

interface TrackProps {
  bins: PowerOf2;
  source: TrackState;
  isSoloOn: boolean;
  isComplete: boolean;
  meta: TrackMetaState;
  context: AudioContext;
  playState: PlayStates;
  onMute: () => void;
  onUnmute: () => void;
  onSolo: () => void;
  onUnsolo: () => void;
  onComplete: () => void;
}

function Track(props: TrackProps) {
  const {
    source,
    context,
    playState,
    meta,
    isSoloOn,
    onComplete,
  } = props;

  const [audio, audioNode, gain] = React.useMemo(() => {
    const a = new Audio();
    a.src = source.source;
    if (context == null) {
      return [a, null, null];
    }

    const sourceNode = context.createMediaElementSource(a);
    const gainNode = context.createGain();
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    a.addEventListener('ended', onComplete);

    return [a, sourceNode, gainNode];
  }, [source.source, context]);

  React.useEffect(() => {
    switch (playState) {
      case PlayStates.Playing:
        if (!source.complete) {
          audio.play();
        }
        break;
      case PlayStates.Unstarted:
      case PlayStates.Ended:
        audio.pause();
        audio.currentTime = 0;
        break;
      case PlayStates.Paused:
        audio.pause();
        break;
    }
  }, [playState]);

  const shouldMakeNoise = (!source.mute && !isSoloOn) || source.solo;

  React.useEffect(() => {
    gain.gain.linearRampToValueAtTime(
      shouldMakeNoise ? 1 : 0.00001,
      context.currentTime + 0.1,
    );
  }, [audio, shouldMakeNoise]);

  if (meta == null) {
    return <div className={cn('multitrek__track', 'multitrek__track--loading')}><p>loading</p></div>;
  }

  return (
    <div className={cn('multitrek__track', { 'multitrek__track--muted': !shouldMakeNoise })}>
      <Waveform
        rms={meta.rms}
        muted={!shouldMakeNoise}
        playState={playState}
      />
    </div>
  );
}

export default Track;
