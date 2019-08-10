import React from 'react';

interface TrackProps {
  sources: string[];
}

const trackTypeReg = /^*+?\.(\w{3,4})$/;

function Track(props: TrackProps) {
  const { sources } = props;
  return (
    <div className='multitrek__track'>
      {/* {
        sources.map((source) => {
          const fileExtMatch = source.match(trackTypeReg);
          if (fileExtMatch == null) { return null; }
          const fileExt = fileExtMatch[1];
          return
        })
      } */}
    </div>
  );
}

export default Track;
