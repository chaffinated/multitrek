import React from 'react';
import produce from 'immer';
import { curry } from 'ramda';
import PlayStates from './PlayStates';
import Transport from './Transport';
import Track from './Track';
import { calculateRMSWaveform } from './utils';
import './styles.scss';


interface MultitrekProps {
  height: number;
  sources: string[];
  track: (any) => any;
  controls: (any) => any;
}

export interface TrackState {
  source: string;
  mute: boolean;
  solo: boolean;
}

export interface TrackMetaState {
  rms: number[];
}

interface MultitrekState {
  sources: TrackState[];
  playState: PlayStates;
  meta: {
    [key: string]: TrackMetaState,
  };
  isReady: boolean;
  error: Error | null;
}

enum ActionTypes {
  SetState,
  Mute,
  Unmute,
  Solo,
  Unsolo,
  Sources,
  TrackMeta,
  ResetReady,
  ConfirmReady,
  PresentError,
}

const initialState = {
  playState: PlayStates.Unstarted,
  sources: [],
  meta: {},
  isReady: false,
  error: null,
};

const createSource = (src: string): TrackState => ({
  source: src,
  mute: false,
  solo: false,
});

function trackReducer(state: MultitrekState, action) {
  switch (action.type) {
    case ActionTypes.SetState:
      return { ...state, playState: action.payload };
    case ActionTypes.Mute:
      return produce(state, (draft) => {
        const source = draft.sources[action.payload]
        if (source) source.mute = true;
      });
    case ActionTypes.Unmute:
      return produce(state, (draft) => {
        const source = draft.sources[action.payload]
        if (source) source.mute = false;
      });
    case ActionTypes.Solo:
      return produce(state, (draft) => {
        const source = draft.sources[action.payload]
        if (source) source.solo = true;
      });
    case ActionTypes.Unsolo:
      return produce(state, (draft) => {
        const source = draft.sources[action.payload]
        if (source) source.solo = false;
      });
    case ActionTypes.Sources:
      return { ...state, sources: new Set(action.payload) };
    case ActionTypes.TrackMeta:
      const { source, ...meta } = action.payload;
      return produce(state, (draft) => {
        draft.sources
          .filter(s => s.source === source)
          .forEach((s) => {
            state.meta[s.source] = meta;
          });
      });
    case ActionTypes.ConfirmReady:
      return { ...state, isReady: true };
    case ActionTypes.ResetReady:
      return { ...state, isReady: false };
    case ActionTypes.PresentError:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function Multitrek(props: MultitrekProps) {
  const { sources, track: TrackComponent } = props;
  const context = React.useMemo(() => new AudioContext(), []);
  const [state, dispatch] = React.useReducer(trackReducer, {
    ...initialState,
    sources: sources.map(createSource),
  });
  const isSoloOn = !!state.sources.find(s => s.soloed);

  const decodeAudio = curry((source, blob) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      context.decodeAudioData(fileReader.result, d => {
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
      });
    });
    fileReader.readAsArrayBuffer(blob);
  });

  const handleLoadError = (error) => {
    dispatch({
      type: ActionTypes.PresentError,
      payload: error,
    });
  };

  React.useEffect(() => {
    dispatch({ type: ActionTypes.ResetReady });
    const p = Promise.all(sources.map((source) => {
      if (state.meta[source] != null) {
        return Promise.resolve();
      }
      return fetch(source)
        .then(res => res.blob())
        .then(decodeAudio(source))
        .catch(handleLoadError);
    }));
    p.then(() => dispatch({ type: ActionTypes.ConfirmReady }))
  }, [sources]);

  if (!state.isReady) {
    return (
      <div className='multitrek'>
        <div className='multitrek__loading'>
          <p>loading tracks</p>
        </div>
      </div>
    )
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
          state.sources.map((source, i) =>
            <TrackComponent
              key={`source-${i}`}
              source={source}
              context={context}
              meta={state.meta[source.source]}
              playState={state.playState}
              isSoloOn={isSoloOn}
              onMute={mute(source)}
              onUnmute={unmute(source)}
              onSolo={solo(source)}
              onUnsolo={unsolo(source)}
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
