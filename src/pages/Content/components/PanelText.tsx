import { Input, Switch } from 'adui';
import React, { useEffect, useState } from 'react';
import { IContentInfo, useStore } from '../stores';
import Remove from './Remove';

const PanelImage = () => {
  const currentContentInfo = useStore((state) => state.currentContentInfo);
  const setCurrentContentInfo = useStore(
    (state) => state.setCurrentContentInfo
  );
  const { el, type, top, infos } = currentContentInfo as IContentInfo;

  return (
    <>
      <div className="flex items-center justify-between mb-3 font-semibold text-sm">
        <div>文本</div>
        <Remove />
      </div>
      <div className="flex mb-3">
        <div className="mr-2 pt-[2px] text-xs">字号</div>
        <div className="flex flex-col gap-1 flex-1">abc</div>
      </div>
    </>
  );
};

export default PanelImage;
