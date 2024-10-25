import React, { useCallback, useEffect } from 'react';
import { useStore } from './stores';

import {
  EDITOR_MAIN_ID,
  IFRAME_ID,
  EDUI_EDITOR_ID,
  LEFT_PANEL_ID,
  JS_TOOLBAR_ID,
} from './utils';

// 这里做一些页面初始化的操作
const Base = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const setEduiEl = useStore((state) => state.setEduiEl);
  const setToolBarEl = useStore((state) => state.setToolBarEl);
  const setBottomToolBarEl = useStore((state) => state.setBottomToolBarEl);
  const editorEl = useStore((state) => state.editorEl);
  const setEditorEl = useStore((state) => state.setEditorEl);
  const setIframeEl = useStore((state) => state.setIframeEl);
  const setLeftPanelEl = useStore((state) => state.setLeftPanelEl);
  const setCurrentHoverEl = useStore((state) => state.setCurrentHoverEl);
  const setCurrentBlockStates = useStore(
    (state) => state.setCurrentBlockStates
  );

  const checkElements = useCallback(() => {
    const leftPanel = document.getElementById(
      LEFT_PANEL_ID
    ) as HTMLDivElement | null;
    const editor = document.getElementById(
      EDITOR_MAIN_ID
    ) as HTMLDivElement | null;
    const edui = document.querySelector(
      `[id^=${EDUI_EDITOR_ID}]`
    ) as HTMLDivElement | null;
    const toolBar = document.querySelector(
      `[id^=${JS_TOOLBAR_ID}]`
    ) as HTMLDivElement | null;
    const bottomToolBar = document.querySelector(
      `#js_button_area .tool_bar`
    ) as HTMLDivElement | null;

    if (editor && edui && leftPanel && toolBar && bottomToolBar) {
      setEditorEl(editor);
      setEduiEl(edui);
      setLeftPanelEl(leftPanel);
      setToolBarEl(toolBar);
      setBottomToolBarEl(bottomToolBar);

      if (leftPanel) {
        leftPanel.addEventListener('click', checkElements, false);
      }

      const foundIframe = document.querySelector(
        `iframe[id^=${IFRAME_ID}]`
      ) as HTMLIFrameElement | null;

      // 向 iframe 的 body 下的所有直接子元素添加 onMouseEnter 事件
      if (foundIframe) {
        setIframeEl(foundIframe);
        const iframeBody = foundIframe.contentDocument?.body;
        if (iframeBody) {
          const children = Array.from(iframeBody.children);
          children.forEach((child) => {
            child.addEventListener(
              'mouseenter',
              () => {
                setCurrentHoverEl(child as HTMLDivElement);
              },
              false
            );
          });
        }
      }
    } else {
      setTimeout(() => {
        checkElements();
      }, 1000);
    }
  }, []);

  const handleEditorMouseLeave = () => {
    if (!useStore.getState().currentBlockStates.editing) {
      setCurrentBlockStates({
        x: 0,
        y: 0,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        width: 0,
        height: 0,
        currentEl: null,
      });
      setCurrentHoverEl(null);
    }
  };

  useEffect(() => {
    checkElements();

    return () => {
      const editorEl = useStore.getState().editorEl;
      if (editorEl) {
        editorEl.removeEventListener(
          'mouseleave',
          handleEditorMouseLeave,
          false
        );
      }
    };
  }, [dimensionSwitch]);

  useEffect(() => {
    if (editorEl) {
      editorEl.addEventListener('mouseleave', handleEditorMouseLeave, false);
    }
  }, [editorEl]);

  const handleWindowScroll = () => {};

  useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll, false);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll, false);
    };
  }, []);

  return <></>;
};

export default Base;
