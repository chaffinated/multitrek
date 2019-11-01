
const calculateRMSWaveform = (buffer, windowLength, rmsLength?: number) => {
  const channel = buffer.getChannelData(0);
  const bufferLength = channel.length;
  const length = rmsLength || bufferLength;
  const windowSize = Math.floor(length / windowLength);
  const averages = [];
  // const now = Date.now();

  let i = 0;
  let sum = 0;
  let rms = 0;

  while (i < length) {
    if (i % windowSize === 0) {
      rms = Math.sqrt(sum / windowSize);
      averages.push(rms);
      sum = 0;
    }

    sum += Math.pow(channel[i] || 0, 2);
    i++;
  }

  // const later = Date.now();
  // console.debug(`rendered in ${later - now} ms`);
  return averages;
};

export default calculateRMSWaveform;
