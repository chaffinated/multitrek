import { useContext, useMemo, useEffect, useState } from 'react';
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
    // isReady,
    // isSoloOn,
    addTrack,
    setTrackMeta,
    // longestTrack,
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
  const [audioChunks, setAudioChunks] = useState([]);

  // if source is present and multitrek is activated, fetch audio
  useEffect(() => {
    if (!state.activated) {
      return;
    }
    addTrack(createTrack(key));
    setTrackMeta({ source: key, meta: createTrackMeta(false) });
  }, [key, state.activated]);


  const onFinish = () => {
    setAudioChunks((chunks) => {
      console.log('finished recording', chunks);
      const newBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
      decodeBlob(newBlob);
      setAudioChunks(() => []);
    });
  };

  // "method" to get audio data + metadata
  const decodeBlob = (blob) => new Promise((resolve) => {
    const fileReader = new FileReader();
    const dispatchTrackMeta = (d) => {
      const waveform = calculateRMSWaveform(d, 512, maxTrackLength);
      const newMeta = {
        ...createTrackMeta(false, d),
        rms: waveform,
      };
      setTrackMeta({ source: key, meta: newMeta });
      resolve(fileReader.result);
    };
    const handleError = (err) => console.warn(err);
    const onBlob = () => {
      context.decodeAudioData(fileReader.result, dispatchTrackMeta, handleError);
    };
    fileReader.addEventListener('load', onBlob);
    fileReader.readAsArrayBuffer(blob);
  });


  const appendAudioChunks = (event) => {
    setAudioChunks((chunks) => {
      const blobs = chunks.concat(event.data);
      const newBlob = new Blob(blobs, { type: 'audio/webm;codecs=opus' });
      decodeBlob(newBlob);
      return blobs;
    });
  };


  useEffect(() => {
    if (recorder != null) {
      return;
    }

    window.navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setEnabledMic(true);
        const mediaRecorder = new window.MediaRecorder(stream);
        mediaRecorder.addEventListener('dataavailable', appendAudioChunks);
        mediaRecorder.addEventListener('stop', onFinish);
        setRecorder(mediaRecorder);
      })
      .catch((err) => {
        setEnabledMic(false);
        console.warn(err);
      });
  }, [maxTrackLength]);


  useEffect(() => {
    if (recorder == null || !enabledMic) {
      return;
    }
    switch (playState) {
      case PlayStates.Playing:
        recorder.state === 'inactive'
          ? recorder.start(600)
          : recorder.resume();
        break;
      case PlayStates.Ended:
      case PlayStates.Unstarted:
        recorder.stop();
        break;
      case PlayStates.Paused:
        recorder.pause();
        break;
    }
  }, [playState]);

  return {
    meta,
    track,
    recorder,
    enabledMic,
    audioChunks,
    solo: onSolo,
    mute: onMute,
    unsolo: onUnsolo,
    unmute: onUnmute,
    complete: onComplete,
    multitrekContext,
  };
};
