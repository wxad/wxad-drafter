import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { useStore } from '../stores';

const blockMap = {
  ml: {
    className: 'wxad-draft-block-cell-ml',
    property: 'marginLeft',
    position: 'left',
    dimension: 'width',
    axis: 'x',
    coEfficient: 1,
  },
  mr: {
    className: 'wxad-draft-block-cell-mr',
    property: 'marginRight',
    position: 'right',
    dimension: 'width',
    axis: 'x',
    coEfficient: -1,
  },
  mt: {
    className: 'wxad-draft-block-cell-mt',
    property: 'marginTop',
    position: 'top',
    dimension: 'height',
    axis: 'y',
    coEfficient: -1,
  },
  mb: {
    className: 'wxad-draft-block-cell-mb',
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
      className={clsx(
        'wxad-draft-block-cell',
        blockMap[type].className,
        value < 4 && 'wxad-draft-block-cell-min'
      )}
      style={{
        [blockMap[type].position]: Math.min(-value, -2),
        [blockMap[type].dimension]: value,
      }}
    >
      <div
        className="wxad-draft-block-cell-inner"
        onMouseDown={handleMouseDown}
      />
      <div className="wxad-draft-block-cell-input-wrapper">
        <input
          className="wxad-draft-block-cell-input"
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
