
const normalize = (waveform) => {
  const max = Math.max.apply(Math, waveform);
  const scalar = 1 / max;
  return waveform.map((s) => s * scalar);
};

export default normalize;
