import { useContext, useMemo, useEffect, useState } from 'react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import MultitrekContext from '../MultitrekContext';
import { TrackState, TrackMetaState, PlayStates } from '../types';
import { calculateRMSWaveform } from '../utils';

const createTrack = (key?: symbol): TrackState => ({
  key,
  source: null,
  mute: false,
  solo: false,
  complete: false,
});

const createTrackMeta = (fetching, buffer?: any): TrackMetaState => ({
  buffer,
  fetching,
  length: buffer && buffer.length,
  duration: buffer && buffer.duration,
  sampleRate: buffer && buffer.sampleRate,
  numberOfChannels: buffer && buffer.numberOfChannels,
  rms: [],
});

const appendBuffer = (ctx: AudioContext, buf1: AudioBuffer, buf2: AudioBuffer) => {
  const numberOfChannels = Math.min(buf1.numberOfChannels, buf2.numberOfChannels );
  const tmp = ctx.createBuffer(numberOfChannels, (buf1.length + buf2.length), buf1.sampleRate);
  for (let i = 0; i < numberOfChannels; i++) {
    const channel = tmp.getChannelData(i);
    channel.set(buf1.getChannelData(i), 0);
    channel.set(buf2.getChannelData(i), buf1.length);
  }
  return tmp;
};


export default () => {
  const multitrekContext = useContext(MultitrekContext);
  const {
    state,
    solo,
    mute,
    unsolo,
    unmute,
    complete,
    context,
    addTrack,
    setTrackMeta,
    maxTrackLength,
  } = multitrekContext;
  const { playState } = state;

  const key = useMemo(() => Symbol(), []);
  const track = state.tracks.find((t) => t.key === key) || createTrack(key);
  const meta = state.meta[key];
  const onSolo = solo(key);
  const onMute = mute(key);
  const onUnsolo = unsolo(key);
  const onUnmute = unmute(key);
  const onComplete = complete(key);
  const [recorder, setRecorder] = useState(null);
  const [enabledMic, setEnabledMic] = useState(null);
  const [audioChunk, setAudioChunk] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(context.createBuffer(1, 1, 44100));

  // if source is present and multitrek is activated, fetch audio
  useEffect(() => {
    if (!state.activated) {
      return;
    }
    addTrack(createTrack(key));
    setTrackMeta({ source: key, meta: createTrackMeta(false) });
  }, [key, state.activated]);

  // request mic permissions and create recorder
  useEffect(() => {
    if (recorder != null) {
      return;
    }

    window.navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 2,
        sampleRate: 48000,
        echoCancellation: true,
      },
      video: false,
    })
      .then((stream) => {
        setEnabledMic(true);
        const mediaRecorder = new RecordRTC(stream, {
          type: 'audio',
          timeSlice: 1500,
          recorderType: StereoAudioRecorder,
          ondataavailable: (blob) => setAudioChunk(blob),
        });
        setRecorder(mediaRecorder);
      })
      .catch((err) => {
        setEnabledMic(false);
        console.warn(err);
      });
  });

  // update audioBuffer when new chunk is present
  useEffect(() => {
    if (audioChunk == null) {
      return;
    }
    const fileReader = new FileReader();
    const createNewBuffer = (d) => {
      const newBuffer = appendBuffer(context, audioBuffer, d);
      setAudioBuffer(newBuffer);
    };
    const handleError = (err) => console.warn(err);
    const onBlob = () => {
      context.decodeAudioData(fileReader.result, createNewBuffer, handleError);
    };
    fileReader.addEventListener('load', onBlob);
    fileReader.readAsArrayBuffer(audioChunk);
  }, [audioChunk]);

  // update rms when new buffer is present
  useEffect(() => {
    const waveform = calculateRMSWaveform(audioBuffer, 512, maxTrackLength);
    const newMeta = {
      ...createTrackMeta(false, audioBuffer),
      rms: waveform,
    };
    setTrackMeta({ source: key, meta: newMeta });
  }, [audioBuffer]);

  // update audio recorder state when playstate changes
  useEffect(() => {
    if (recorder == null || !enabledMic) {
      return;
    }
    switch (playState) {
      case PlayStates.Playing:
        recorder.getState() === 'inactive'
          ? recorder.startRecording()
          : recorder.resumeRecording();
        break;
      case PlayStates.Ended:
      case PlayStates.Unstarted:
        recorder.stopRecording();
        onFinish();
        break;
      case PlayStates.Paused:
        recorder.pauseRecording();
        break;
    }
  }, [playState, recorder]);

  // do something when recording ends
  const onFinish = () => {
    // something
  };

  return {
    meta,
    track,
    recorder,
    enabledMic,
    audioBuffer,
    solo: onSolo,
    mute: onMute,
    unsolo: onUnsolo,
    unmute: onUnmute,
    complete: onComplete,
    multitrekContext,
  };
};
