import React from 'react'
import PlayStatus from '../constants/PlayStatus';

export default ({className = 'icon-play', status, ...props}) => {
  const playMask = status === PlayStatus.PLAYING
    ? 'playing'
    : 'paused';

  return (
    <svg className={className} {...props} xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fillRule="evenodd">
      <defs>
        <mask id="paused">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon points="36 30, 70 50, 70 50, 36 70" fill="black" />
        </mask>
        <mask id="playing">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon points="30 30, 70 30, 70 70, 30 70" fill="black" />
        </mask>

        <linearGradient id={`${className}__bg`} className={`${className}__bg`}  x1='0' y1='0' x2='1' y2='1'>
          <stop className={`${className}__bg__stop1`} offset='0%' />
          <stop className={`${className}__bg__stop2`} offset='100%' />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="49" className={`${className}__button-fill`} />
      <circle cx="50" cy="50" r="50" mask={`url(#${playMask})`} fill={`url(#${className}__bg)`} />
    </svg>
  )
}
