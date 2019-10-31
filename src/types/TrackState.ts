
export interface TrackState {
  source: string;
  mute: boolean;
  solo: boolean;
  key: symbol;
  complete: boolean;
}

export interface TrackMetaState {
  buffer: AudioBuffer;
  length: number;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  rms: number[];
  fetching: boolean;
  error?: Error;
}
