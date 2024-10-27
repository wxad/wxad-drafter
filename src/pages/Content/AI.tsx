import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useStore } from './stores';

const AI: React.FC = () => {
  const bottomToolBarEl = useStore((state) => state.bottomToolBarEl);

  const handleClick = async () => {
    // const res = await axios.get('https://wxad-drafter-api.vercel.app/api/hello');

    // axios
    // get
    // https://wxad-drafter-api.vercel.app/api/check
    // params { text: '文案内容' }
    const res = await axios.get(
      'https://wxad-drafter-api.vercel.app/api/check',
      {
        params: {
          text: '文案内容',
        },
      }
    );

    console.log(res);
  };

  return (
    <>
      {bottomToolBarEl &&
        createPortal(
          <div onClick={handleClick}>检查文案</div>,
          bottomToolBarEl
        )}
    </>
  );
};

export default AI;
