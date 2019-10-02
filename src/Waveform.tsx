import React from 'react';
import { normalizeRMSWaveform } from './utils';
import { PlayStates } from './types';

interface WaveformProps {
  rms: number[];
  muted: boolean;
  playState: PlayStates;
}

const HEIGHT = 500;
const HALF_HEIGHT = HEIGHT / 2;
const SVG_CLASS = `multitrek__waveform__svg`;

function Waveform(props: WaveformProps) {
  const { rms, muted } = props;
  const width = rms.length;
  const normalizedWaveform = normalizeRMSWaveform(rms);
  const bars = normalizedWaveform.map((gain, i) => {
    const x = i;
    const height = gain * HEIGHT;
    const y = HALF_HEIGHT - height / 2;
    return <rect className={`${SVG_CLASS}__sample`} key={i} x={x} y={y} width={1} height={height} />;
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
        <defs>
          <linearGradient id='shadow' gradientTransform='rotate(90)'>
            <stop offset='0%' stopColor='rgba(255, 255, 255, 0.69)' />
            <stop offset='14%' stopColor='rgba(255, 255, 255, 0.55)' />
            <stop offset='60%' stopColor='rgba(255, 255, 255, 1)' />
          </linearGradient>
        </defs>

        { bars }
        <rect
          className={`${SVG_CLASS}__shadow`}
          x={0}
          y={HALF_HEIGHT}
          width={width}
          height={HALF_HEIGHT}
          fill='url(#shadow)'
        />
      </svg>
    </div>
  );
}

export default Waveform;
