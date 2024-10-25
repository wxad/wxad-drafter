import React, { useCallback, useEffect, useState } from 'react';
import RightPanel from './RightPanel';
import Dimenson from './Dimension';
import Base from './Base';
// import AI from './AI';

const App = () => {
  return (
    <>
      <Base />
      <Dimenson />
      <RightPanel />
      {/* <AI /> */}
    </>
  );
};

export default App;
