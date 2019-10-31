import { PlayStates, MultitrekState } from '../types';
import produce from 'immer';

export enum ActionTypes {
  SetState,
  SetTime,
  Seek,
  Mute,
  Unmute,
  Solo,
  Unsolo,
  Activate,
  Complete,
  AddTrack,
  SetTrackMeta,
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
  currentTime: 0,
  seekPosition: 0,
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
        const track = draft.tracks.find((s) => s.key === action.payload);
        if (track) {
          track.mute = true;
        }
      });

    case ActionTypes.Unmute:
      return produce(state, (draft) => {
        const track = draft.tracks.find((s) => s.key === action.payload);
        if (track) {
          track.mute = false;
        }
      });

    case ActionTypes.Solo:
      return produce(state, (draft) => {
        const track = draft.tracks.find((s) => s.key === action.payload);
        if (track) {
          track.solo = true;
        }
      });

    case ActionTypes.Unsolo:
      return produce(state, (draft) => {
        const track = draft.tracks.find((s) => s.key === action.payload);
        if (track) {
          track.solo = false;
        }
      });

    case ActionTypes.Complete:
      return produce(state, (draft) => {
        const track = draft.tracks.find((s) => s.key === action.payload);
        if (track) {
          track.complete = true;
        }
      });

    case ActionTypes.AddTrack:
      return produce(state, (draft) => {
        if (!draft.tracks.includes(action.payload)) {
          draft.tracks.push(action.payload);
        }
      });

    case ActionTypes.SetTrackMeta:
      const { source, meta } = action.payload;
      return produce(state, (draft) => {
        draft.meta[source] = meta;
      });

    case ActionTypes.Activate:
      return { ...state, activated: true };

    case ActionTypes.ConfirmReady:
      return { ...state, isReady: true };

    case ActionTypes.ResetReady:
      return { ...state, isReady: false };

    case ActionTypes.PresentError:
      return { ...state, error: action.payload };

    case ActionTypes.Seek:
      return { ...state, seekPosition: action.payload };

    case ActionTypes.SetTime:
      return { ...state, currentTime: action.payload };

    default:
      return state;
  }
}

export default trackReducer;
