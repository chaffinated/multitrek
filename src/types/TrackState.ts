
export interface TrackState {
  source: string;
  mute: boolean;
  solo: boolean;
  key: symbol;
}

export interface TrackMetaState {
  buffer: AudioBuffer;
  length: number;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  rms: number[];
}
