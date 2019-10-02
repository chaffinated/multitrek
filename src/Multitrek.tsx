import React from 'react';
import produce from 'immer';
import { curry } from 'ramda';
import Track from './Track';
import Transport from './Transport';
import { calculateRMSWaveform } from './utils';
import { MultitrekState, TrackState, PlayStates } from './types';
import trackReducer, { initialState, ActionTypes } from './state';

import './styles.scss';


interface MultitrekProps {
  height: number;
  sources: string[];
  track: (component: any) => any;
  controls: (component: any) => any;
}

const createTrack = (src: string): TrackState => ({
  source: src,
  mute: false,
  solo: false,
  complete: false,
  key: Symbol(src),
});


function Multitrek(props: MultitrekProps) {
  const { sources, track: TrackComponent, controls: ControlComponent } = props;
  const [state, dispatch]: [MultitrekState, (any) => any] = React.useReducer(trackReducer, {
    ...initialState,
    tracks: sources.map(createTrack),
  });
  const context = React.useMemo(() => state.activated ? new AudioContext() : null, [state.activated]);
  const isSoloOn = state.tracks.some(s => s.solo);
  const isComplete = state.tracks.every((t) => t.complete);


  // "method" to get audio data + metadata
  const decodeAudio = curry((source, blob) => new Promise((resolve) => {
    const fileReader = new FileReader();
    const setTrackMeta = (d) => {
      const action = {
        type: ActionTypes.TrackMeta,
        payload: {
          source,
          meta: {
            buffer: d,
            length: d.length,
            duration: d.duration,
            sampleRate: d.sampleRate,
            numberOfChannels: d.numberOfChannels,
            rms: [],
          },
        },
      };
      dispatch(action);
      resolve(fileReader.result);
    };
    fileReader.addEventListener('load', () => {
      context.decodeAudioData(fileReader.result, setTrackMeta);
    });
    fileReader.readAsArrayBuffer(blob);
  }));


  //
  const handleLoadError = (error) => {
    console.warn(error);
    dispatch({
      type: ActionTypes.PresentError,
      payload: error,
    });
  };


  // request audio data & decode
  React.useEffect(() => {
    if (!state.activated) {
      return;
    }
    dispatch({ type: ActionTypes.ResetReady });
    const requests = sources.map((source) => {
      if (state.meta[source] != null) {
        return Promise.resolve();
      }
      return fetch(source)
        .then((res) => res.blob())
        .then(decodeAudio(source))
        .catch(handleLoadError);
    });
    Promise.all(requests)
      .then(() => dispatch({ type: ActionTypes.ConfirmReady }));
  }, [sources, state.activated]);


  // "computed" value of longest track (for reference)
  const longestTrack = React.useMemo(() => {
    if (!state.isReady) {
      return null;
    }
    return Object.values(state.meta)
      .reduce((l, track) => {
        if (l == null || track.duration && track.duration > l.duration) {
          return track;
        }
        return l;
      }, null);
  });

  const maxTrackLength = (longestTrack && longestTrack.length) || 0;
  const maxTrackDuration = (longestTrack && longestTrack.duration) || 0;


  // calculate waveform after audio is loaded
  React.useEffect(() => {
    if (!state.isReady) {
      return;
    }
    Object.entries(state.meta)
      .forEach(([trackSrc, track]) => {
        const newMeta = produce(track, (draft) => {
          if (draft == null) {
            return;
          }
          draft.rms = calculateRMSWaveform(draft.buffer, 512, maxTrackLength);
        });
        dispatch({ type: ActionTypes.TrackMeta, payload: { source: trackSrc, meta: newMeta }});
    });
  }, [sources, state.isReady]);


  // on load and when all tracks are complete, end play state
  React.useEffect(() => {
    dispatch({ type: ActionTypes.SetState, payload: PlayStates.Ended });
  }, [isComplete]);


  if (!state.activated) {
    const activate = () => dispatch({ type: ActionTypes.Activate });
    return (
      <div className='multitrek' onClick={activate}>
        <div className='multitrek__loading'>
          <p>click to activate</p>
        </div>
      </div>
    );
  }

  if (!state.isReady) {
    return (
      <div className='multitrek'>
        <div className='multitrek__loading'>
          <p>loading tracks</p>
        </div>
      </div>
    );
  }

  const play = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Playing });
  const stop = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Unstarted });
  const pause = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Paused });
  const mute = (sourceKey) => () => dispatch({ type: ActionTypes.Mute, payload: sourceKey });
  const solo = (sourceKey) => () => dispatch({ type: ActionTypes.Solo, payload: sourceKey });
  const unmute = (sourceKey) => () => dispatch({ type: ActionTypes.Unmute, payload: sourceKey });
  const unsolo = (sourceKey) => () => dispatch({ type: ActionTypes.Unsolo, payload: sourceKey });
  const complete = (sourceKey) => () => dispatch({ type: ActionTypes.Complete, payload: sourceKey });
  const setTime = (audio) => () => dispatch({ type: ActionTypes.SetTime, payload: audio.currentTime });

  return (
    <div className='multitrek'>
      <div className='multitrek__tracks'>
        {
          state.tracks.map((source, i) =>
            <TrackComponent
              key={`source-${i}`}
              source={source}
              context={context}
              meta={state.meta[source.source]}
              playState={state.playState}
              seekPosition={state.seekPosition}
              isSoloOn={isSoloOn}
              onMute={mute(source.key)}
              onUnmute={unmute(source.key)}
              onSolo={solo(source.key)}
              onUnsolo={unsolo(source.key)}
              onComplete={complete(source.key)}
              setTime={state.meta[source.source] === longestTrack ? setTime : null }
            />)
        }
      </div>

      <ControlComponent
        playState={state.playState}
        maxTrackLength={maxTrackLength}
        maxTrackDuration={maxTrackDuration}
        multitrekState={state}
        dispatch={dispatch}
        pause={pause}
        play={play}
        stop={stop}
      />
    </div>
  );
}

Multitrek.defaultProps = {
  height: 800,
  track: Track,
  controls: Transport,
};

export default Multitrek;
