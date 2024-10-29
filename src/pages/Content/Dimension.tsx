import { Switch } from 'adui';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
// import Switch from './components/Switch';
import BlockCell from './components/BlockCell';
import { useStore } from './stores';

// 这里实现调整间距的功能
const Dimenson = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const setDimensionSwitch = useStore((state) => state.setDimensionSwitch);
  const toolBarEl = useStore((state) => state.toolBarEl);
  const currentDimensionStates = useStore(
    (state) => state.currentDimensionStates
  );
  const setCurrentDimensionState = useStore(
    (state) => state.setCurrentDimensionState
  );
  const currentHoverEl = useStore((state) => state.currentHoverEl);
  const eduiEl = useStore((state) => state.eduiEl);

  const reCalculateBlock = () => {
    const iframeEl = useStore.getState().iframeEl;
    const editorEl = useStore.getState().editorEl;
    const eduiEl = useStore.getState().eduiEl;
    const target =
      currentHoverEl || useStore.getState().currentDimensionStates.currentEl;

    if (!iframeEl || !editorEl || !eduiEl || !target) {
      return;
    }
    const targetRect = target.getBoundingClientRect();
    const iframeRect = iframeEl.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();
    const eduiRect = eduiEl.getBoundingClientRect();

    setCurrentDimensionState({
      currentEl: target,
      x: targetRect.left + editorRect.left - eduiRect.left,
      y: targetRect.top + iframeRect.top - eduiRect.top,
      marginTop: parseInt(
        getComputedStyle(target).getPropertyValue('margin-top')
      ),
      marginRight: parseInt(
        getComputedStyle(target).getPropertyValue('margin-right')
      ),
      marginBottom: parseInt(
        getComputedStyle(target).getPropertyValue('margin-bottom')
      ),
      marginLeft: parseInt(
        getComputedStyle(target).getPropertyValue('margin-left')
      ),
      paddingTop: parseInt(
        getComputedStyle(target).getPropertyValue('padding-top')
      ),
      paddingRight: parseInt(
        getComputedStyle(target).getPropertyValue('padding-right')
      ),
      paddingBottom: parseInt(
        getComputedStyle(target).getPropertyValue('padding-bottom')
      ),
      paddingLeft: parseInt(
        getComputedStyle(target).getPropertyValue('padding-left')
      ),
      width: targetRect.width,
      height: targetRect.height,
    });
  };

  useEffect(() => {
    /**
     * 注意：此事件绑定中所有的状态都需实时获取
     */
    if (
      !useStore.getState().currentDimensionStates.editing &&
      useStore.getState().dimensionSwitch
    ) {
      reCalculateBlock();
    }
  }, [currentHoverEl]);

  return (
    <>
      {toolBarEl &&
        createPortal(
          <div className="inline-flex items-center align-middle ml-4 pl-4 border-solid border-l border-[#e7e7eb]">
            <Switch
              checked={dimensionSwitch}
              onChange={() => {
                setDimensionSwitch(!dimensionSwitch);
              }}
              checkedText="调整间距"
              unCheckedText="调整间距"
            />
          </div>,
          toolBarEl
        )}
      {eduiEl &&
        dimensionSwitch &&
        currentDimensionStates.width > 0 &&
        currentDimensionStates.height > 0 &&
        createPortal(
          <div
            className="absolute z-[117] bg-[#4597f8] bg-opacity-10"
            style={{
              top: currentDimensionStates.y,
              left: currentDimensionStates.x,
              width: currentDimensionStates.width,
              height: currentDimensionStates.height,
            }}
          >
            {(['ml', 'mr', 'mt', 'mb'] as const).map((type) => (
              <BlockCell
                key={type}
                type={type}
                onChange={() => {
                  reCalculateBlock();
                }}
              />
            ))}
          </div>,
          eduiEl
        )}
    </>
  );
};

export default Dimenson;
