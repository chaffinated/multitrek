import React from 'react';
import { normalizeRMSWaveform } from './utils';

interface WaveformProps {
  rms: number[];
  muted: boolean;
}

const HEIGHT = 500;
const SVG_CLASS = `multitrek__waveform__svg`;

function Waveform(props: WaveformProps) {
  const { rms, muted } = props;
  const width = rms.length;
  const normalizedWaveform = normalizeRMSWaveform(rms);
  const bars = normalizedWaveform.map((gain, i) => {
    const x = i;
    const height = gain * HEIGHT;
    const y = HEIGHT - height;
    return <rect key={i} x={x} y={y} width={1} height={height} />;
  });

  return (
    <div className='multitrek__waveform'>
      <svg
        className={muted ? `${SVG_CLASS} ${SVG_CLASS}--muted` : SVG_CLASS}
        height={HEIGHT}
        width={width}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        preserveAspectRatio='none'
      >
        { bars }
      </svg>
    </div>
  );
}

export default Waveform;
