import { useContext, useMemo, useEffect } from 'react';
import MultitrekContext from '../MultitrekContext';
import { TrackState, TrackMetaState, PlayStates } from '../types';
import { calculateRMSWaveform } from '../utils';

interface TrackProps {
  source: string;
}

const createTrack = (source: string, key?: symbol): TrackState => ({
  source,
  mute: false,
  solo: false,
  complete: false,
  key: key || Symbol(source),
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


export default ({ source }: TrackProps) => {
  const multitrekContext = useContext(MultitrekContext);
  const {
    state,
    solo,
    mute,
    unsolo,
    unmute,
    setTime,
    complete,
    context,
    isReady,
    isSoloOn,
    addTrack,
    setTrackMeta,
    longestTrack,
    maxTrackLength,
  } = multitrekContext;
  const { playState, seekPosition } = state;

  const key = useMemo(() => Symbol(source), []);
  const track = state.tracks.find((t) => t.key === key) || createTrack(source, key);
  const meta = state.meta[source];
  const onSolo = solo(track.key);
  const onMute = mute(track.key);
  const onUnsolo = unsolo(track.key);
  const onUnmute = unmute(track.key);
  const onComplete = complete(track.key);

  // on load error
  const handleLoadError = (error: Error) => {
    setTrackMeta({ source, meta: { ...meta, error }});
  };

  // "method" to get audio data + metadata
  const decodeAudio = (blob) => new Promise((resolve) => {
    const fileReader = new FileReader();
    const dispatchTrackMeta = (d) => {
      setTrackMeta({ source, meta: createTrackMeta(false, d) });
      resolve(fileReader.result);
    };
    const onFileLoad = () => context.decodeAudioData(fileReader.result, dispatchTrackMeta);
    fileReader.addEventListener('load', onFileLoad);
    fileReader.readAsArrayBuffer(blob);
  });

  // if source is present and multitrek is activated, fetch audio
  useEffect(() => {
    if (!state.activated) {
      return;
    }
    addTrack(createTrack(source, key));
    setTrackMeta({ source, meta: createTrackMeta(true) });
    fetch(source)
      .then((res) => res.blob())
      .then(decodeAudio)
      .catch(handleLoadError);
  }, [source, state.activated]);

  // once multitrek is ready and maxTrackLength has been calculated,
  // generate a waveform
  useEffect(() => {
    if (meta == null || meta.buffer == null) {
      return;
    }
    setTrackMeta({
      source,
      meta: {
        ...meta,
        rms: calculateRMSWaveform(meta.buffer, 512, maxTrackLength),
      },
    });
  }, [isReady, maxTrackLength, track.source]);

  // get or create an audio and gain node
  const [audio, gain] = useMemo(() => {
    const a = new Audio();
    a.src = track.source;
    if (context == null) {
      return [a, null, null];
    }

    const sourceNode = context.createMediaElementSource(a);
    const gainNode = context.createGain();
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    a.addEventListener('ended', onComplete);

    return [a, gainNode];
  }, [source, context]);

  // stop / start audio
  useEffect(() => {
    switch (playState) {
      case PlayStates.Playing:
        if (!track.complete) {
          audio.play();
        }
        break;
      case PlayStates.Unstarted:
      case PlayStates.Ended:
        audio.pause();
        audio.currentTime = 0;
        break;
      case PlayStates.Paused:
        audio.pause();
        break;
    }
  }, [playState]);


  // mute / solo / unmute / unsolo audio
  const shouldMakeNoise = (!track.mute && !isSoloOn) || track.solo;

  useEffect(() => {
    gain.gain.linearRampToValueAtTime(
      shouldMakeNoise ? 1 : 0.00001,
      context.currentTime + 0.1,
    );
  }, [audio, shouldMakeNoise]);


  // stop / start audio
  useEffect(() => {
    try {
      if (playState === PlayStates.Playing) {
        audio.play();
      }
      audio.currentTime = seekPosition;
    } catch (err) {
      console.warn(err);
    }
  }, [seekPosition]);


  // update multitrek state time on 'timeupdate' play event
  useEffect(() => {
    if (meta !== longestTrack) {
      return () => { /* no op */ };
    }
    const updateTime = setTime(audio);
    audio.addEventListener('timeupdate', updateTime);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [track, meta, longestTrack]);

  return {
    meta,
    track,
    gain,
    audio,
    shouldMakeNoise,
    solo: onSolo,
    mute: onMute,
    unsolo: onUnsolo,
    unmute: onUnmute,
    complete: onComplete,
    multitrekContext,
  };
};
