import { useReducer, useMemo } from 'react';
import multitrekReducer, { ActionTypes, initialState } from '../state';
import { PlayStates, TrackState, TrackMetaState } from '../types';

const AC = window.AudioContext || window.webkitAudioContext;

interface SetTrackMetaPayload {
  source: string;
  meta: TrackMetaState;
}

export default () => {
  const [state, dispatch] = useReducer(multitrekReducer, initialState);
  const context = useMemo(() => state.activated ? new AC() : null, [state.activated]);
  const isSoloOn = state.tracks.some((s) => s.solo);
  const isComplete = state.tracks.every((t) => t.complete);
  const areTracksReady = Object.values(state.meta).every((meta: TrackMetaState) => !meta.fetching);

  const end = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Ended });
  const play = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Playing });
  const stop = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Unstarted });
  const pause = () => dispatch({ type: ActionTypes.SetState, payload: PlayStates.Paused });
  const activate = () => dispatch({ type: ActionTypes.Activate });
  const mute = (sourceKey: symbol) => () => dispatch({ type: ActionTypes.Mute, payload: sourceKey });
  const solo = (sourceKey: symbol) => () => dispatch({ type: ActionTypes.Solo, payload: sourceKey });
  const unmute = (sourceKey: symbol) => () => dispatch({ type: ActionTypes.Unmute, payload: sourceKey });
  const unsolo = (sourceKey: symbol) => () => dispatch({ type: ActionTypes.Unsolo, payload: sourceKey });
  const complete = (sourceKey: symbol) => () => dispatch({ type: ActionTypes.Complete, payload: sourceKey });
  const setTime = (audio) => () => dispatch({ type: ActionTypes.SetTime, payload: audio.currentTime });
  const addTrack = (payload: TrackState) => dispatch({ type: ActionTypes.AddTrack, payload });
  const setTrackMeta = (payload: SetTrackMetaPayload) => dispatch({ type: ActionTypes.SetTrackMeta, payload });
  const resetReady = () => dispatch({ type: ActionTypes.ResetReady });

  // "computed" value of longest track (for reference)
  const longestTrack = useMemo(() => {
    if (!areTracksReady) {
      return null;
    }
    return Object.values(state.meta)
      .reduce((l: TrackMetaState, track: TrackMetaState) => {
        if (l == null || track.duration && track.duration > l.duration) {
          return track;
        }
        return l;
      }, null);
  }, [areTracksReady, state.meta]);

  const maxTrackLength = (longestTrack && longestTrack.length) || 0;
  const maxTrackDuration = (longestTrack && longestTrack.duration) || 0;

  return {
    state,
    end,
    play,
    stop,
    mute,
    solo,
    pause,
    unmute,
    unsolo,
    setTime,
    activate,
    addTrack,
    longestTrack,
    setTrackMeta,
    areTracksReady,
    maxTrackLength,
    maxTrackDuration,
    context,
    complete,
    isSoloOn,
    isComplete,
    resetReady,
    dispatch,
  };
};
