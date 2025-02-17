import React, { useCallback, useEffect } from 'react';
import { useStore } from './stores';
import {
  EDITOR_MAIN_ID,
  EDUI_EDITOR_ID,
  getComponentType,
  IFRAME_ID,
  JS_TOOLBAR_ID,
  LEFT_PANEL_ID,
} from './utils';

// 这里做一些页面初始化的操作
const Base = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const setBottomMainEl = useStore((state) => state.setBottomMainEl);
  const setEduiEl = useStore((state) => state.setEduiEl);
  const setToolBarEl = useStore((state) => state.setToolBarEl);
  const setBottomToolBarEl = useStore((state) => state.setBottomToolBarEl);
  const editorEl = useStore((state) => state.editorEl);
  const setEditorEl = useStore((state) => state.setEditorEl);
  const iframeEl = useStore((state) => state.iframeEl);
  const setIframeEl = useStore((state) => state.setIframeEl);
  const setLeftPanelEl = useStore((state) => state.setLeftPanelEl);
  const setCurrentHoverEl = useStore((state) => state.setCurrentHoverEl);
  const setCurrentClickEl = useStore((state) => state.setCurrentClickEl);
  const setCurrentDimensionState = useStore(
    (state) => state.setCurrentDimensionState
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
    const bottomMainEl = document.getElementById(
      'bottom_main'
    ) as HTMLDivElement | null;

    if (
      editor &&
      edui &&
      leftPanel &&
      toolBar &&
      bottomToolBar &&
      bottomMainEl
    ) {
      setEditorEl(editor);
      setEduiEl(edui);
      setLeftPanelEl(leftPanel);
      setToolBarEl(toolBar);
      setBottomToolBarEl(bottomToolBar);
      setBottomMainEl(bottomMainEl);

      if (leftPanel) {
        leftPanel.addEventListener('click', checkElements, false);
      }

      const foundIframe = document.querySelector(
        `iframe[id^=${IFRAME_ID}]`
      ) as HTMLIFrameElement | null;

      // 向 iframe 的 body 下的所有直接子元素添加 onMouseEnter 事件
      if (foundIframe) {
        setIframeEl(foundIframe);
      }
    } else {
      setTimeout(() => {
        checkElements();
      }, 1000);
    }
  }, []);

  const handleEditorMouseLeave = () => {
    if (!useStore.getState().currentDimensionStates.editing) {
      setCurrentDimensionState({
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

  const bindEvents = () => {
    const iframeBody = iframeEl?.contentDocument?.body;
    if (iframeBody) {
      const children = Array.from(iframeBody.children);
      children.forEach((child) => {
        const type = getComponentType(child);
        child.addEventListener(
          'mouseenter',
          () => {
            setCurrentHoverEl(child as HTMLDivElement);
          },
          false
        );
        // child.addEventListener(
        //   'mouseleave',
        //   () => {
        //     setCurrentHoverEl(null);
        //   },
        //   false
        // );
        child.addEventListener(
          'click',
          (e) => {
            if (['image', 'carousel'].includes(type)) {
              e.preventDefault();
              e.stopPropagation();
            }
            setCurrentClickEl(child as HTMLDivElement);
          },
          false
        );
      });
    }
  };

  useEffect(() => {
    if (iframeEl) {
      const resizeObserver = new ResizeObserver(() => {
        bindEvents();
      });
      resizeObserver.observe(iframeEl.contentDocument?.body as Element);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [iframeEl]);

  const handleWindowScroll = () => {};
  const handleWindowClick = () => {
    setCurrentClickEl(null);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll, false);
    window.addEventListener('click', handleWindowClick, false);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll, false);
      window.removeEventListener('click', handleWindowClick, false);
    };
  }, []);

  return <></>;
};

export default Base;
