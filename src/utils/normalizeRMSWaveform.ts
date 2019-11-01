
const normalize = (waveform) => {
  let max = 0.001;
  let val = 0;
  for (let i = waveform.length - 1; i >= 0; i--) {
    val = waveform[i];
    max = val > max ? val : max;
  }
  const scalar = 1 / max;
  return waveform.map((s) => s * scalar);
};

export default normalize;
