
export interface TrackState {
  source: string;
  mute: boolean;
  solo: boolean;
  key: symbol;
}

export interface TrackMetaState {
  rms: number[];
}
