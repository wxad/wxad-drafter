import React, { useEffect, useRef } from 'react';
import { useStore } from '../stores';
import { cn } from '../utils';

const blockMap = {
  ml: {
    className: 'wxad-draft-block-cell-ml top-0 h-full min-w-1 cursor-e-resize',
    property: 'marginLeft',
    position: 'left',
    dimension: 'width',
    axis: 'x',
    coEfficient: 1,
  },
  mr: {
    className: 'wxad-draft-block-cell-mr top-0 h-full min-w-1 cursor-w-resize',
    property: 'marginRight',
    position: 'right',
    dimension: 'width',
    axis: 'x',
    coEfficient: -1,
  },
  mt: {
    className: 'wxad-draft-block-cell-mt left-0 w-full min-h-1 cursor-n-resize',
    property: 'marginTop',
    position: 'top',
    dimension: 'height',
    axis: 'y',
    coEfficient: -1,
  },
  mb: {
    className: 'wxad-draft-block-cell-mb left-0 w-full min-h-1 cursor-s-resize',
    property: 'marginBottom',
    position: 'bottom',
    dimension: 'height',
    axis: 'y',
    coEfficient: 1,
  },
} as const;

interface IBlockCell {
  onChange: () => void;
  type: 'ml' | 'mr' | 'mt' | 'mb';
}

const BlockCell: React.FC<IBlockCell> = ({ type, onChange }) => {
  const currentBlockStates = useStore((state) => state.currentBlockStates);
  const value = currentBlockStates[blockMap[type].property];

  const setCurrentBlockStates = useStore(
    (state) => state.setCurrentBlockStates
  );
  const start = useRef(0);

  const handleMouseMove = (e: MouseEvent) => {
    const diff =
      (blockMap[type].axis === 'x' ? e.clientX : e.clientY) - start.current;
    if (currentBlockStates.currentEl) {
      currentBlockStates.currentEl.style[blockMap[type].property] = `${Math.min(
        Math.max(value + diff * blockMap[type].coEfficient, 0),
        99
      )}px`;
    }
    onChange();
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    document.documentElement.style.cursor = '';
    setCurrentBlockStates({ editing: false });
    const iframeEl = useStore.getState().iframeEl;
    if (iframeEl) {
      iframeEl.style.userSelect = '';
      iframeEl.style.pointerEvents = '';

      // 重新计算 iframe 内 body 的高度，公众平台会设一个固定的高度
      const body = iframeEl.contentDocument?.body;
      if (body) {
        body.style.height = '';
        const height = body.scrollHeight;
        body.style.height = `${height}px`;
        iframeEl.style.height = `${height}px`;
        (iframeEl.parentNode as HTMLDivElement).style.height = `${height}px`;
      }
    }
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    start.current = blockMap[type].axis === 'x' ? e.clientX : e.clientY;
    document.documentElement.style.cursor =
      blockMap[type].axis === 'x' ? 'ew-resize' : 'ns-resize';
    const iframeEl = useStore.getState().iframeEl;
    if (iframeEl) {
      iframeEl.style.userSelect = 'none';
      iframeEl.style.pointerEvents = 'none';
    }
    setCurrentBlockStates({ editing: true });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      handleMouseUp();
    };
  }, []);

  return (
    <div
      className={cn(
        'absolute',
        blockMap[type].className,
        value < 4 && 'wxad-draft-block-cell-min'
      )}
      style={{
        [blockMap[type].position]: Math.min(-value, -2),
        [blockMap[type].dimension]: value,
      }}
    >
      <div
        className="wxad-draft-block-cell-inner absolute top-0 left-0 w-full h-full select-none"
        onMouseDown={handleMouseDown}
      />
      <div className="wxad-draft-block-cell-input-wrapper absolute p-[2px]">
        <input
          className="p-[3px] w-[22px] text-white text-center text-xs leading-3 font-medium whitespace-nowrap bg-[#4597f8] border-none rounded-sm outline-none cursor-text pointer-events-auto"
          value={value}
          onFocus={() => setCurrentBlockStates({ editing: true })}
          onBlur={() => setCurrentBlockStates({ editing: false })}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) || value === '') {
              if (currentBlockStates.currentEl) {
                currentBlockStates.currentEl.style[
                  blockMap[type].property
                ] = `${Math.min(parseInt(value) || 0, 99)}px`;
              }
              onChange();
            }
          }}
        />
      </div>
    </div>
  );
};

export default BlockCell;
