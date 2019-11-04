import React from 'react';
import cn from 'classnames';
import { useRecordingTrackState } from './hooks';
import Waveform from './Waveform';

interface RecordingTrackProps {
  onFinish: (blob: Blob) => any;
}

const BUTTON_CLASS = 'multitrek__track__control';
const MUTE_BUTTON_CLASS = `${BUTTON_CLASS} multitrek__track__control--mute`;
const SOLO_BUTTON_CLASS = `${BUTTON_CLASS} multitrek__track__control--solo`;


function RecordingTrack(props: RecordingTrackProps) {
  const { onFinish } = props;
  const {
    meta,
    track,
    solo,
    mute,
    unsolo,
    unmute,
    enabledMic,
    multitrekContext,
  } = useRecordingTrackState({ onFinish });
  const { state } = multitrekContext;
  const { playState } = state;

  // wait for audio to load
  if (meta == null || meta.fetching) {
    return <div className={cn('multitrek__track', 'multitrek__track--loading')}><p>loading</p></div>;
  }

  if (!enabledMic) {
    return (
      <div className={cn('multitrek__track', 'multitrek__track--loading')}>
        <p>please enable your microphone</p>
      </div>
    );
  }

  return (
    <div className={cn('multitrek__track', 'multitrek__track--recording')}>
      <div className='multitrek__track__controls'>
        <button
          className={ track.mute ? `${MUTE_BUTTON_CLASS} ${MUTE_BUTTON_CLASS}--active` : MUTE_BUTTON_CLASS}
          onClick={ track.mute ? unmute : mute }
        >
          M
        </button>

        <button
          className={ track.solo ? `${SOLO_BUTTON_CLASS} ${SOLO_BUTTON_CLASS}--active` : SOLO_BUTTON_CLASS}
          onClick={ track.solo ? unsolo : solo }
        >
          S
        </button>
      </div>

      <Waveform
        rms={meta.rms}
        muted={false}
        playState={playState}
      />
    </div>
  );
}

export default RecordingTrack;
