import React from 'react';
import Track from './Track';
import Transport from './Transport';
import { useMultitrekState } from './hooks';
import { Provider } from './MultitrekContext';

import './styles.scss';

interface MultitrekProps {
  height: number;
  children: React.Children;
  controls: (component: any) => any;
}


function Multitrek(props: MultitrekProps) {
  const multitrekState = useMultitrekState();
  const { state, isComplete, end, activate } = multitrekState;

  // on load and when all tracks are complete, end play state
  React.useEffect(end, [isComplete]);

  if (!state.activated) {
    return (
      <div className='multitrek' onClick={activate}>
        <div className='multitrek__loading'>
          <p>click to activate</p>
        </div>
      </div>
    );
  }

  return (
    <Provider value={multitrekState}>
      <div className='multitrek'>
        { props.children }
      </div>
    </Provider>
  );
}

Multitrek.defaultProps = {
  height: 800,
  track: Track,
  controls: Transport,
};

export default Multitrek;
