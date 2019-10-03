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

  // get or create an audio and gain node
  const [audio, gain] = React.useMemo(() => {
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

    return [a, gainNode];
  }, [source.source, context]);


  // stop / start audio
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


  // mute / solo / unmute / unsolo audio
  const shouldMakeNoise = (!source.mute && !isSoloOn) || source.solo;

  React.useEffect(() => {
    gain.gain.linearRampToValueAtTime(
      shouldMakeNoise ? 1 : 0.00001,
      context.currentTime + 0.1,
    );
  }, [audio, shouldMakeNoise]);


  // stop / start audio
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


  // update multitrek state time on 'timeupdate' play event
  React.useEffect(() => {
    if (setTime == null) {
      return () => { /* no op */ };
    }
    const updateTime = setTime(audio);
    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [setTime]);


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
      />
    </div>
  );
}

export default Track;
