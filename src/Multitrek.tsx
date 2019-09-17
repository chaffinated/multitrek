import React from 'react';
import { curry } from 'ramda';
import { TrackState, PlayStates } from './types';
import Transport from './Transport';
import Track from './Track';
import { calculateRMSWaveform } from './utils';
import trackReducer, { initialState, ActionTypes } from './state';
import './styles.scss';


interface MultitrekProps {
  height: number;
  sources: string[];
  track: (any) => any;
  controls: (any) => any;
}

const createTrack = (src: string): TrackState => ({
  source: src,
  mute: false,
  solo: false,
  key: Symbol(src),
});


function Multitrek(props: MultitrekProps) {
  const { sources, track: TrackComponent } = props;
  const context = React.useMemo(() => new AudioContext(), []);
  const [state, dispatch] = React.useReducer(trackReducer, {
    ...initialState,
    tracks: sources.map(createTrack),
  });
  const isSoloOn = !!state.tracks.find(s => s.soloed);

  const decodeAudio = curry((source, blob) => new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      context.decodeAudioData(fileReader.result, (d) => {
        const action = {
          type: ActionTypes.TrackMeta,
          payload: {
            source,
            meta: {
              rms: calculateRMSWaveform(d, 512),
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
  }, [sources]);


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
            />
          )
        }
      </div>

      <Transport
        playState={state.playState}
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
