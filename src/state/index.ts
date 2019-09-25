import { PlayStates, MultitrekState } from '../types';
import produce from 'immer';

export enum ActionTypes {
  SetState,
  Mute,
  Unmute,
  Solo,
  Unsolo,
  Sources,
  Activate,
  Complete,
  TrackMeta,
  ResetReady,
  ConfirmReady,
  PresentError,
}

export const initialState: MultitrekState = {
  playState: PlayStates.Unstarted,
  tracks: [],
  meta: {},
  error: null,
  isReady: false,
  activated: false,
};

function trackReducer(state: MultitrekState = initialState, action) {
  switch (action.type) {
    case ActionTypes.SetState:
      return produce(state, (draft) => {
        if (
          action.payload === PlayStates.Unstarted ||
          action.payload === PlayStates.Ended
        ) {
          draft.tracks.forEach((t) => t.complete = false);
        }
        draft.playState = action.payload;
      });

    case ActionTypes.Mute:
      return produce(state, (draft) => {
        const track = draft.tracks.find(s => s.key === action.payload);
        if (track) {
          track.mute = true;
        }
      });

    case ActionTypes.Unmute:
      return produce(state, (draft) => {
        const track = draft.tracks.find(s => s.key === action.payload);
        if (track) {
          track.mute = false;
        }
      });

    case ActionTypes.Solo:
      return produce(state, (draft) => {
        const track = draft.tracks.find(s => s.key === action.payload);
        if (track) {
          track.solo = true;
        }
      });

    case ActionTypes.Unsolo:
      return produce(state, (draft) => {
        const track = draft.tracks.find(s => s.key === action.payload);
        if (track) {
          track.solo = false;
        }
      });

    case ActionTypes.Complete:
      return produce(state, (draft) => {
        const track = draft.tracks.find(s => s.key === action.payload);
        if (track) {
          track.complete = true;
        }
      });

    case ActionTypes.Sources:
      return { ...state, sources: new Set(action.payload) };

    case ActionTypes.TrackMeta:
      const { source, meta } = action.payload;
      return produce(state, (draft) => {
        draft.tracks
          .filter(s => s.source === source)
          .forEach((s) => {
            state.meta[s.source] = meta;
          });
      });

    case ActionTypes.Activate:
      return { ...state, activated: true };

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

export default trackReducer;
