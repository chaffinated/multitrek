import React from 'react';
import PlayStates from './constants/PlayStates';
import Controls from './Controls';
import Track from './Track';


interface MultitrekProps {
  sources: Array<string | string[]>;
}

function Multitrek(props: MultitrekProps) {
  const { sources } = props;
  const [playState, setPlayState] = React.useState(PlayStates.Stopped);
  const play = () => setPlayState(PlayStates.Playing);
  const pause = () => setPlayState(PlayStates.Paused);
  const stop = () => setPlayState(PlayStates.Stopped);

  return (
    <div className='multitrek'>
      <h2>player here</h2>

      <div className='multitrek__tracks'>
        {
          sources.map((source) =>
            <Track
              key={source.toString()}
              sources={Array.isArray(source) ? source : [source]}
            />,
          )
        }
      </div>

      <Controls
        playState={playState}
        pause={pause}
        play={play}
        stop={stop}
      />
    </div>
  );
}

export default Multitrek;
