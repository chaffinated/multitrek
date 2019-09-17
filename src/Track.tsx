import React from 'react';
import PlayStates from './types/PlayStates';
import { TrackState, TrackMetaState } from './types/TrackState';
import Waveform from './Waveform';

interface TrackProps {
  bins: PowerOf2;
  source: TrackState;
  isSoloOn: boolean;
  meta: TrackMetaState;
  context: AudioContext;
  playState: PlayStates;
  onMute: () => void;
  onUnmute: () => void;
  onSolo: () => void;
  onUnsolo: () => void;
}

const BUTTON_CLASS = 'multitrek__track__control';
const MUTE_BUTTON_CLASS = `${BUTTON_CLASS} multitrek__track__control--mute`;
const SOLO_BUTTON_CLASS = `${BUTTON_CLASS} multitrek__track__control--solo`;

function Track(props: TrackProps) {
  const {
    source,
    context,
    playState,
    meta,
    isSoloOn,
    onMute,
    onUnmute,
    onSolo,
    onUnsolo,
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
    return [a, sourceNode, gainNode];
  }, [source, context]);

  React.useEffect(() => {
    switch (playState) {
      case PlayStates.Playing:
        audio.play();
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

  if (meta == null) {
    return <div className='multitrek__track'><p>loading</p></div>;
  }

  const shouldMakeNoise = (!source.mute && !isSoloOn) || source.solo;

  gain.gain.exponentialRampToValueAtTime(
    shouldMakeNoise ? 1 : 0.0001,
    audio.currentTime + 0.3,
  );

  return (
    <div className='multitrek__track'>
      <div className='multitrek__track__controls'>
        <button
          className={ source.mute ? `${MUTE_BUTTON_CLASS} ${MUTE_BUTTON_CLASS}--active` : MUTE_BUTTON_CLASS}
          onClick={ source.mute ? onUnmute : onMute }
        >
          M
        </button>

        <button
          className={ source.solo ? `${SOLO_BUTTON_CLASS} ${SOLO_BUTTON_CLASS}--active` : SOLO_BUTTON_CLASS}
          onClick={ source.solo ? onUnsolo : onSolo }
        >
          S
        </button>
      </div>

      {
        meta.rms != null && <Waveform rms={meta.rms} muted={source.mute} />
      }
    </div>
  );
}

export default Track;
