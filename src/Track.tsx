import React from 'react';
import PlayStates from './PlayStates';
import { TrackMetaState } from './Multitrek';
import Waveform from './Waveform';

interface TrackProps {
  bins: PowerOf2,
  source: string;
  muted: boolean;
  soloed: boolean;
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
    muted,
    soloed,
    isSoloOn,
    onMute,
    onUnmute,
    onSolo,
    onUnsolo,
  } = props;

  const [audio, audioNode, gain] = React.useMemo(() => {
    const a = new Audio();
    a.src = source;
    const sourceNode = context.createMediaElementSource(a);
    const gainNode = context.createGain();
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    return [a, sourceNode, gainNode];
  }, [source]);

  React.useEffect(() => {
    switch(playState) {
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
    return <div className='multitrek__track'><p>loading</p></div>
  }

  const shouldMakeNoise = (!muted && !isSoloOn) || soloed;
  
  gain.gain.exponentialRampToValueAtTime(
    shouldMakeNoise ? 1 : 0.0001,
    audio.currentTime + 0.3,
  );
    
  return (
    <div className='multitrek__track'>
      <div className="multitrek__track__controls">
        <button
          className={ muted ? `${MUTE_BUTTON_CLASS} ${MUTE_BUTTON_CLASS}--active` : MUTE_BUTTON_CLASS}
          onClick={ muted ? onUnmute : onMute }
        >
          M
        </button>
        
        <button
          className={ soloed ? `${SOLO_BUTTON_CLASS} ${SOLO_BUTTON_CLASS}--active` : SOLO_BUTTON_CLASS}
          onClick={ soloed ? onUnsolo : onSolo }
        >
          S
        </button>
      </div>

      <Waveform rms={meta.rms} muted={muted} />
    </div>
  );
}

export default Track;
