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
  key: Symbol(src),
});


function Multitrek(props: MultitrekProps) {
  const { sources, track: TrackComponent } = props;
  const [state, dispatch]: [MultitrekState, (any) => any] = React.useReducer(trackReducer, {
    ...initialState,
    tracks: sources.map(createTrack),
  });
  const context = React.useMemo(() => state.activated ? new AudioContext() : null, [state.activated]);
  const isSoloOn = state.tracks.some(s => s.solo);


  const decodeAudio = curry((source, blob) => new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      context.decodeAudioData(fileReader.result, (d) => {
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
      });
    });
    fileReader.readAsArrayBuffer(blob);
  }));

  const handleLoadError = (error) => {
    console.warn(error);
    dispatch({
      type: ActionTypes.PresentError,
      payload: error,
    });
  };


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
        .then(res => res.blob())
        .then(decodeAudio(source))
        .catch(handleLoadError);
    });
    Promise.all(requests)
      .then(() => dispatch({ type: ActionTypes.ConfirmReady }));
  }, [sources, state.activated]);


  React.useEffect(() => {
    if (!state.isReady) {
      return;
    }
    const maxTrackLength = Object.values(state.meta)
      .reduce((l, track) => {
        if (track.length && track.length > l) {
          return track.length;
        }
        return l;
      }, 0);

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
  const mute = (source) => () => dispatch({ type: ActionTypes.Mute, payload: source });
  const solo = (source) => () => dispatch({ type: ActionTypes.Solo, payload: source });
  const unmute = (source) => () => dispatch({ type: ActionTypes.Unmute, payload: source });
  const unsolo = (source) => () => dispatch({ type: ActionTypes.Unsolo, payload: source });

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
              isSoloOn={isSoloOn}
              onMute={mute(source.key)}
              onUnmute={unmute(source.key)}
              onSolo={solo(source.key)}
              onUnsolo={unsolo(source.key)}
            />)
        }
      </div>

      <Transport
        playState={state.playState}
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
