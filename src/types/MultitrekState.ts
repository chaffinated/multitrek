import { TrackState, TrackMetaState } from './TrackState';
import PlayStates from './PlayStates';

interface MultitrekState {
  tracks: TrackState[];
  playState: PlayStates;
  meta: {
    [key: string]: TrackMetaState,
  };
  isReady: boolean;
  error: Error | null;
}

export default MultitrekState;
