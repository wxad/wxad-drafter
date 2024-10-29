import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PanelCarousel from './components/PanelCarousel';
import PanelImage from './components/PanelImage';
import { useStore } from './stores';
import { cn, extractAttributeValue, getComponentType } from './utils';

const RightPanel = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const eduiEl = useStore((state) => state.eduiEl);
  const editorEl = useStore((state) => state.editorEl);
  const iframeEl = useStore((state) => state.iframeEl);
  const currentContentInfo = useStore((state) => state.currentContentInfo);
  const setCurrentContentInfo = useStore(
    (state) => state.setCurrentContentInfo
  );
  const currentHoverEl = useStore((state) => state.currentHoverEl);
  const currentClickEl = useStore((state) => state.currentClickEl);
  const currentDimensionStates = useStore(
    (state) => state.currentDimensionStates
  );

  const { type, top } = currentContentInfo || {};

  const reCalculateIframeHeight = () => {
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

  useEffect(() => {
    reCalculateIframeHeight();
  }, [currentContentInfo]);

  useEffect(() => {
    if (currentClickEl) {
      const rect = currentClickEl.getBoundingClientRect();
      const type = getComponentType(currentClickEl);
      let infos: { [key: string]: any } = {};

      if (type === 'image') {
        infos.viewBox = extractAttributeValue(
          currentClickEl.outerHTML,
          'viewBox'
        );
        infos.image = extractAttributeValue(
          currentClickEl.outerHTML,
          'background-image'
        );
        infos.link = extractAttributeValue(currentClickEl.outerHTML, 'href');
      }

      if (type === 'carousel') {
        // 获取所有 currentClickEl foreignObject svg 有 background-image 且为 url 的元素
        const svgs = Array.from(
          currentClickEl.querySelectorAll('foreignObject svg[style*="url"]')
        ) as SVGSVGElement[];

        infos.carousel = Array.from(svgs).map((svg) => {
          return {
            el: svg,
            image: svg.style.backgroundImage,
          };
        });
      }

      setCurrentContentInfo({
        el: currentClickEl,
        type,
        top: rect.top,
        infos,
      });
    } else {
      setCurrentContentInfo(null);
    }
  }, [currentClickEl]);

  useEffect(() => {
    // 给当前 hover 的元素添加 cursor 样式
    if (currentHoverEl) {
      const type = getComponentType(currentHoverEl);
      if (['image', 'carousel'].includes(type)) {
        currentHoverEl.style.cursor = 'pointer';
      }
    }

    return () => {
      if (currentHoverEl) {
        currentHoverEl.style.cursor = '';
      }
    };
  }, [currentHoverEl]);

  return (
    <>
      {editorEl && currentContentInfo && (
        <div
          className={cn(
            'absolute left-0 pt-2 px-4 pl-3 bg-white rounded shadow-inherit',
            // 调整间距模式下，隐藏 panel
            dimensionSwitch ? 'hidden' : ''
          )}
          style={{
            // 顶部位置写死 不算了
            top: (top || 0) + 153,
          }}
          onClick={(e) => {
            // Base.tsx 中对 window 上增加了 click 事件，用于清除 currentClickEl
            e.stopPropagation();
          }}
        >
          {type === 'image' && <PanelImage />}
          {type === 'carousel' && <PanelCarousel />}
        </div>
      )}
      {eduiEl &&
        createPortal(
          <div
            className={cn(
              'absolute z-[117] pointer-events-none bg-[#4597F8] bg-opacity-15',
              currentHoverEl ? 'block' : 'hidden'
            )}
            style={{
              top: currentDimensionStates.y,
              left: currentDimensionStates.x,
              width: currentDimensionStates.width,
              height: currentDimensionStates.height,
            }}
          ></div>,
          eduiEl
        )}
    </>
  );
};

export default RightPanel;
