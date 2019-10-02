import React from 'react';
import cn from 'classnames';
import PlayStates from './types/PlayStates';
import { TrackState, TrackMetaState } from './types/TrackState';
import Waveform from './Waveform';


interface TrackProps {
  bins: PowerOf2;
  source: TrackState;
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
    onComplete,
    seekPosition,
    setTime,
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


  React.useEffect(() => {
    try {
      if (playState === PlayStates.Playing) {
        audio.play();
      }
      audio.currentTime = seekPosition;
    } catch (err) {
      console.warn(err);
    }
  }, [seekPosition]);


  React.useEffect(() => {
    if (setTime == null) {
      return () => { /* no op */ };
    }
    const updateTime = setTime(audio);
    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [setTime]);


  if (meta == null) {
    return <div className={cn('multitrek__track', 'multitrek__track--loading')}><p>loading</p></div>;
  }

  return (
    <div className={cn('multitrek__track', { 'multitrek__track--muted': !shouldMakeNoise })}>
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

      <Waveform
        rms={meta.rms}
        muted={!shouldMakeNoise}
        playState={playState}
      />
    </div>
  );
}

export default Track;
