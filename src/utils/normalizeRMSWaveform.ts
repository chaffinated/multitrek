
const normalize = (waveform) => {
  const max = waveform.reduce((currentMax, sample) => {
    if (sample > currentMax) return sample;
    return currentMax;
  }, 0.001);
  
  const scalar = 1 / max;
  return waveform.map((sample) => sample * scalar);
};

export default normalize;
