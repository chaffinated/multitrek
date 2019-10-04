import { TrackState, TrackMetaState } from './TrackState';
import PlayStates from './PlayStates';

interface MultitrekState {
  tracks: TrackState[];
  playState: PlayStates;
  meta: {
    [key: string]: TrackMetaState,
  };
  isReady: boolean;
  activated: boolean;
  error: Error | null;
  currentTime: number;
  seekPosition: number;
}

export interface ActionType {
  type: string | number;
  payload?: any;
}

export default MultitrekState;
