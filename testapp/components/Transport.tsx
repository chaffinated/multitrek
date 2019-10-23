import React from 'react';
import { ActionTypes } from '../../src/state';
import { PlayStates, MultitrekState } from '../../src/types';


interface ControlsProps {
  playState: PlayStates;
  play: (e: Event) => void;
  stop: (e: Event) => void;
  pause: (e: Event) => void;
  maxTrackLength: number;
  maxTrackDuration: number;
  multitrekState: MultitrekState;
  dispatch: (action: any) => any;
}

const KnobControlsSizes = {
  width: 1000,
  height: 200,
};

const KnobSizes = {
  cx: KnobControlsSizes.width / 2,
  cy: KnobControlsSizes.height / 2,
  rx: KnobControlsSizes.height / 4,
  ry: KnobControlsSizes.height / 4 * 0.95,
  depth: KnobControlsSizes.height / 4 * 0.4,
};

function Controls(props: ControlsProps) {
  const { playState, play, stop, pause, multitrekState, maxTrackDuration, dispatch } = props;
  const { currentTime } = multitrekState;
  const { tracks } = multitrekState;
  const playheadPosition = currentTime / maxTrackDuration * 100;
  const disableStop = [PlayStates.Playing, PlayStates.Unstarted].includes(playState);

  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [shouldCursorDisplay, setShouldCursorDisplay] = React.useState(false);

  const handleMouseOver = () => setShouldCursorDisplay(true);
  const handleMouseLeave = () => setShouldCursorDisplay(false);
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX } = e;
    const { left } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCursorPosition(clientX - left);
  };
  const handleClick = (e: MouseEvent) => {
    const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dispatch({ type: ActionTypes.Seek, payload: (e.clientX - left) / width * maxTrackDuration });
  };

  const soloed = React.useMemo(() => tracks.find((t) => t.solo), [tracks]);
  const soloedIdx = tracks.indexOf(soloed);
  const knobRotation = -90 * (soloedIdx / tracks.length) + 45;

  const toggle = () => {
    const toSolo = soloedIdx === tracks.length - 1
      ? tracks[0]
      : tracks.find((t, i) => !t.solo && (i > soloedIdx));

    tracks.forEach((t) => {
      dispatch({
        type: t === toSolo ? ActionTypes.Solo : ActionTypes.Unsolo,
        payload: t.key,
      });
    });
  };

  React.useEffect(() => {
    toggle();
  }, []);

  return (
    <div className='multitrek__transport'>
      <div className='multitrek__controls'>
        {
          playState === PlayStates.Playing
            ? <button className='multitrek__control multitrek__play' onClick={pause}>
                <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
                  <rect x='20' y='5' width='20' height='95' />
                  <rect x='60' y='5' width='20' height='95' />
                </svg>
              </button>
            : <button className='multitrek__control multitrek__play' onClick={play}>
                <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
                  <path d='M 20 0 L 95 50 L 20 100 Z' />
                </svg>
              </button>
        }

        <button className='multitrek__control multitrek__stop' onClick={stop} disabled={disableStop}>
          <svg className='multitrek__control__icon' width='100' height='100' viewBox='0 0 100 100'>
            <rect x='10' y='10' width='80' height='80' />
          </svg>
        </button>

        <svg
          className='multitrek__toggle'
          {...KnobControlsSizes}
          viewBox={`0 0 ${KnobControlsSizes.width} ${KnobControlsSizes.height}`}
          preserveAspectRatio='xMidYMid'
        >
          <defs>
            <filter id='top-knob-shadow'>
              <feDropShadow dx='2' dy='4' stdDeviation='1' floodColor='rgba(50, 50, 50, 0.5)' floodOpacity='0.1' />
            </filter>
            <filter id='knob-shadow'>
              <feDropShadow dx='4' dy='6' stdDeviation='5' floodColor='rgba(50, 50, 50, 0.9)' floodOpacity='0.3' />
            </filter>
            <linearGradient id='knob-gradient'>
              <stop offset='10%' stopColor='rgb(225, 220, 245)' />
              <stop offset='15%' stopColor='rgb(215, 219, 229)' />
              <stop offset='94%' stopColor='rgb(171, 169, 189)' />
              <stop offset='100%' stopColor='rgb(225, 220, 245)' />
            </linearGradient>

            <ellipse
              id='knob-top'
              {...KnobSizes}
              strokeWidth='0.2%'
              fill='white'
              style={{ filter: 'url(#top-knob-shadow)' }}
            />

            <clipPath id='knob-top-clip'>
              <use href='#knob-top' strokeWidth='0' stroke='black' />
            </clipPath>
          </defs>

          <g
            className='multitrek__toggle__knob'
            onClick={toggle}
          >
            <path
              stroke='rgb(141, 139, 149)'
              strokeWidth='0.2%'
              fill='url(#knob-gradient)'
              d={`
                M ${KnobSizes.cx - KnobSizes.rx} ${KnobSizes.cy}
                L ${(KnobSizes.cx - KnobSizes.rx) * 1.005} ${KnobSizes.cy + KnobSizes.depth}
                A ${KnobSizes.rx} ${KnobSizes.ry} 180 0 0
                ${(KnobSizes.cx + KnobSizes.rx) * 0.995} ${KnobSizes.cy + KnobSizes.depth}
                L ${KnobSizes.cx + KnobSizes.rx} ${KnobSizes.cy}
                Z
              `}
              style={{ filter: 'url(#knob-shadow)' }}
            />
            <use
              href='#knob-top'
              x='0'
              y='0'
              stroke='rgb(205, 202, 208)'
              strokeWidth='0.2%'
              fill='rgb(252, 249, 255)'
              style={{ filter: 'url(#top-knob-shadow)' }}
            />
            <line
              className='multitrek__toggle__knob__indicator'
              x1='0'
              y1={KnobSizes.cy}
              x2={KnobSizes.cx}
              y2={KnobSizes.cy}
              clipPath='url(#knob-top-clip)'
              stroke='black'
              strokeWidth='0.2%'
              transform={`rotate(${knobRotation}, ${KnobSizes.cx}, ${KnobSizes.cy})`}
            />
          </g>

          <g>
            {
              tracks.map((track, i) => {
                const f = i / tracks.length;
                const y = (f * 0.9 * KnobControlsSizes.height) + 0.1 * KnobControlsSizes.height;
                const key = `$track.source}-${i}`;
                const x = KnobSizes.cx - KnobSizes.rx;
                const d = (f - 0.5) * 90;
                const r = Math.sin(4 * (d - 45) / 360 * Math.PI);
                return (
                  <g key={key}>
                    <path
                      id={key}
                      stroke='black'
                      fill='none'
                      d={`
                        M 0 ${y}
                        L ${x * 0.85} ${y}
                        L ${(x * 0.995) + r * 10} ${KnobSizes.cy + d + r}
                      `}
                    />
                    <text className='multitrek__toggle__text'>
                      <textPath href={`#${key}`}>
                        { track.source.length > 24 ? `${track.source.slice(0, 24)}...` : track.source }
                      </textPath>
                    </text>
                  </g>
                );
              })
            }
          </g>
        </svg>
      </div>

      <div
        className='multitrek__transport__hud'
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          className='multitrek__transport__playhead'
          style={{ left: `${playheadPosition}%` }}
        />

        {
          shouldCursorDisplay
            ? <div className='multitrek__transport__cursor' style={{ left: cursorPosition }} />
            : null
        }
      </div>
    </div>
  );
}

export default Controls;
