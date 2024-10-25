import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from './stores';
import Switch from './components/Switch';
import BlockCell from './components/BlockCell';

// 这里实现调整间距的功能
const Dimenson = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const setDimensionSwitch = useStore((state) => state.setDimensionSwitch);
  const toolBarEl = useStore((state) => state.toolBarEl);
  const currentBlockStates = useStore((state) => state.currentBlockStates);
  const setCurrentBlockStates = useStore(
    (state) => state.setCurrentBlockStates
  );
  const currentHoverEl = useStore((state) => state.currentHoverEl);
  const eduiEl = useStore((state) => state.eduiEl);

  const reCalculateBlock = () => {
    const iframeEl = useStore.getState().iframeEl;
    const editorEl = useStore.getState().editorEl;
    const eduiEl = useStore.getState().eduiEl;
    const target =
      currentHoverEl || useStore.getState().currentBlockStates.currentEl;

    if (!iframeEl || !editorEl || !eduiEl || !target) {
      return;
    }
    const targetRect = target.getBoundingClientRect();
    const iframeRect = iframeEl.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();
    const eduiRect = eduiEl.getBoundingClientRect();

    setCurrentBlockStates({
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
      !useStore.getState().currentBlockStates.editing &&
      useStore.getState().dimensionSwitch
    ) {
      reCalculateBlock();
    }
  }, [currentHoverEl]);

  return (
    <>
      {toolBarEl &&
        createPortal(
          <div className="wxad-draft-tool">
            <Switch
              className="wxad-draft-dimension"
              checked={dimensionSwitch}
              onChange={() => {
                setDimensionSwitch(!dimensionSwitch);
              }}
            >
              调整间距
            </Switch>
          </div>,
          toolBarEl
        )}
      {eduiEl &&
        currentBlockStates.width > 0 &&
        currentBlockStates.height > 0 &&
        createPortal(
          <div
            className="wxad-draft-block"
            style={{
              top: currentBlockStates.y,
              left: currentBlockStates.x,
              width: currentBlockStates.width,
              height: currentBlockStates.height,
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
