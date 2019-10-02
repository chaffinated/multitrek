import { range } from 'ramda';

const calculateRMSWaveform = (buffer, windowLength, rmsLength?: number) => {
  const channels = range(0, buffer.numberOfChannels - 1)
    .map((c) => buffer.getChannelData(c));

  const bufferLength = channels[0].length;
  const length = rmsLength || bufferLength;
  const windowSize = Math.floor(length / windowLength);
  const averages = [];

  let i = 0;
  let sum = 0;
  let rms = 0;

  while (i < length) {
    if (i % windowSize === 0) {
      rms = Math.sqrt(sum / (windowSize * channels.length));
      averages.push(rms);
      sum = 0;
    }

    sum += channels.reduce((m, c) => {
      m += Math.pow(c[i] || 0, 2);
      return m;
    }, 0);

    i++;
  }

  return averages;
};

export default calculateRMSWaveform;
