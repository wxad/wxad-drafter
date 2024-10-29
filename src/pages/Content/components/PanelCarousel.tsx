import React from 'react';
import Remove from './Remove';

const PanelCarousel: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-3 font-semibold text-sm">
        <div>横滑</div>
        <Remove />
      </div>
      <div className="flex mb-3">
        <div className="mr-2 pt-[2px] text-xs">
          图片
          <div className="scale-90 opacity-50">{`<5M`}</div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <CarouselUpload />
        </div>
      </div>
    </>
  );
};

export default PanelCarousel;
