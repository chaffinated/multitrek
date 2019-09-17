import { range } from 'ramda';

const calculateRMSWaveform = (buffer, bins) => {
  const channels = range(0, buffer.numberOfChannels - 1)
    .map(c => buffer.getChannelData(c));
  const channelLength = channels[0].length;
  const windowLength = Math.floor(channelLength / bins);
  const averages = [];
  const base = Math.floor(channelLength / bins);
  let i = 0;
  let sum = 0;
  let rms = 0;

  while (i < channelLength) {
    if (i % base === 0) {
      rms = Math.sqrt(sum / (windowLength * channels.length))
      averages.push(rms);
      sum = 0;
    }

    sum += channels.reduce((m, c) => {
      m += Math.pow(c[i], 2);
      return m;
    }, 0);

    i++;
  }
  return averages;
};

export default calculateRMSWaveform;
