import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BlockCell from './components/BlockCell';
import Panel from './components/Panel';
import Switch from './components/Switch';
import { useStore } from './stores';
import {
  EDITOR_MAIN_ID,
  IFRAME_ID,
  EDUI_EDITOR_ID,
  LEFT_PANEL_ID,
  JS_TOOLBAR_ID,
  getComponentType,
  extractAttributeValue,
} from './utils';

const RightPanel = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const setDimensionSwitch = useStore((state) => state.setDimensionSwitch);
  const eduiEl = useStore((state) => state.eduiEl);
  const setEduiEl = useStore((state) => state.setEduiEl);
  const toolBarEl = useStore((state) => state.toolBarEl);
  const setToolBarEl = useStore((state) => state.setToolBarEl);
  const setBottomToolBarEl = useStore((state) => state.setBottomToolBarEl);
  const editorEl = useStore((state) => state.editorEl);
  const iframeEl = useStore((state) => state.iframeEl);
  const setEditorEl = useStore((state) => state.setEditorEl);
  const setIframeEl = useStore((state) => state.setIframeEl);
  const setLeftPanelEl = useStore((state) => state.setLeftPanelEl);
  const currentBlockStates = useStore((state) => state.currentBlockStates);
  const setCurrentBlockStates = useStore(
    (state) => state.setCurrentBlockStates
  );
  const contentInfos = useStore((state) => state.contentInfos);
  const setContentInfos = useStore((state) => state.setContentInfos);

  // 轮询检查 EDITOR_MAIN_ID 元素是否存在，存在后再 createPortal
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
            child.addEventListener('mouseenter', handleElMouseEnter, false);
          });
        }
      }
    } else {
      setTimeout(() => {
        checkElements();
      }, 1000);
    }
  }, []);

  /**
   * 注意：此事件绑定中所有的状态都需实时获取
   */
  const handleElMouseEnter = (e: Event) => {
    if (
      !useStore.getState().currentBlockStates.editing &&
      useStore.getState().dimensionSwitch
    ) {
      reCalculateBlock(e.target as HTMLDivElement);
    }
  };

  const reCalculateBlock = (currentEl?: HTMLDivElement | null) => {
    const iframeEl = useStore.getState().iframeEl;
    const editorEl = useStore.getState().editorEl;
    const eduiEl = useStore.getState().eduiEl;
    const target =
      currentEl || useStore.getState().currentBlockStates.currentEl;

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
    }
  };

  // 获取 iframe 内容，输出 DSL
  const getContentInfos = () => {
    const iframeEl = useStore.getState().iframeEl;
    if (!iframeEl) {
      return;
    }
    const iframeBody = iframeEl.contentDocument?.body;
    if (!iframeBody) {
      return;
    }
    const children = Array.from(iframeBody.children) as HTMLDivElement[];
    let infos = children
      .map((el) => {
        const type = getComponentType(el);
        const top = el.getBoundingClientRect().top;
        let infos: { [key: string]: any } = {};

        if (type === 'image') {
          infos.viewBox = extractAttributeValue(el.outerHTML, 'viewBox');
          infos.image = extractAttributeValue(el.outerHTML, 'background-image');
          infos.link = extractAttributeValue(el.outerHTML, 'href');
        }

        if (type === 'carousel') {
          // 获取所有 el foreignObject svg 有 background-image 且为 url 的元素
          const svgs = Array.from(
            el.querySelectorAll('foreignObject svg[style*="url"]')
          ) as SVGSVGElement[];

          infos.carousel = Array.from(svgs).map((svg) => {
            return {
              el: svg,
              image: svg.style.backgroundImage,
            };
          });
        }

        return {
          el,
          type,
          top,
          infos,
        };
      })
      .filter((el) => el.type);

    // 220 是每一个项目的高度
    // 再处理一遍 infos 的 top，所有元素是根据 top 绝对定位的，这里要保证元素之间不相互覆盖
    // 前一个元素的 top + 220 如果大于后一个元素的 top，就把后一个元素的 top 设置为前一个元素的 top + 220，以此类推
    infos = infos.map((info, index, arr) => {
      if (index > 0) {
        const prev = arr[index - 1];
        if (info.top < prev.top + 220) {
          info.top = prev.top + 220;
        }
      }
      return info;
    });

    setContentInfos(infos);
  };

  useEffect(() => {
    if (editorEl) {
      editorEl.addEventListener('mouseleave', handleEditorMouseLeave, false);
    }
  }, [editorEl]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      getContentInfos();
    });

    if (iframeEl) {
      resizeObserver.observe(iframeEl);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [iframeEl]);

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

  const handleWindowScroll = () => {};

  useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll, false);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll, false);
    };
  }, []);

  return (
    <>
      {toolBarEl &&
        createPortal(
          <div className="wxad-draft-tool">
            <Switch
              className="wxad-draft-dimension"
              style={{ display: 'flex' }}
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
      {editorEl && (
        <>
          {contentInfos.map((info, index) => (
            <Panel
              key={index}
              {...info}
              onChange={(newInfo) => {
                const newInfos = [...contentInfos];
                newInfos[index] = newInfo;
                setContentInfos(newInfos);

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
                    (
                      iframeEl.parentNode as HTMLDivElement
                    ).style.height = `${height}px`;
                  }
                }
              }}
            />
          ))}
        </>
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

export default RightPanel;
