import { Button, Input, Popconfirm, Switch } from 'adui';
import React, { useEffect, useState } from 'react';
import { IContentInfo, useStore } from '../stores';
import { cn, putPic, uploadFileBySource } from '../utils';
import CarouselUpload from './CarouselUpload';
import PanelImage from './PanelImage';

const Panel: React.FC = () => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const currentContentInfo = useStore((state) => state.currentContentInfo);
  const setCurrentClickEl = useStore((state) => state.setCurrentClickEl);
  const { el, type, top, infos } = currentContentInfo as IContentInfo;
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'error'
  >('idle');

  const handleMouseEnter = () => {
    if (el) {
      el.style.boxShadow = '0 0 0 1.5px #4597F8 inset';
    }
  };
  const handleMouseLeave = () => {
    if (el) {
      el.style.boxShadow = '';
    }
  };

  useEffect(() => {
    return () => {
      handleMouseLeave();
    };
  }, []);

  const updateLink = (newLink: string) => {
    let targetEl = el.querySelector('a') as HTMLAnchorElement | undefined;

    if (!targetEl) {
      const svg =
        el.tagName.toUpperCase() === 'SVG'
          ? el
          : (el.querySelector('svg') as SVGSVGElement);
      svg.innerHTML = `
      <a
        href="${newLink}"
        _href="${newLink}"
        target="_blank"
        data-linktype="2"
      >
        <rect x="0" y="0" width="${infos.viewBox?.split(' ')[2]}" height="${
        infos.viewBox?.split(' ')[3]
      }" fill="transparent"></rect>
      </a>`;
    } else {
      targetEl.setAttribute('href', newLink);
      targetEl.setAttribute('_href', newLink);
    }

    if (targetEl) {
      targetEl.style.pointerEvents = newLink ? 'auto' : 'none';
    }
  };

  const updateImage = (newImage: string, width: string, height: string) => {
    // 找到包括 el 及 el 在内的第一个具有 inline background-image 的元素，而且 background-image 得是一个 url，把纯色或 gradient 的筛选掉
    const targetEl =
      el.tagName.toUpperCase() === 'SVG' &&
      el.style.backgroundImage.includes('url')
        ? el
        : (el.querySelector('[style*="background-image"][style*="url"]') as
            | HTMLElement
            | undefined);

    if (targetEl) {
      targetEl.style.backgroundImage = newImage;

      if (targetEl.tagName.toUpperCase() === 'SVG') {
        targetEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
        targetEl.style.display = 'block';
      }
    }

    // 找到 rect，修改 rect 的宽高

    const rect = el.querySelector('rect') as SVGRectElement | undefined;

    if (rect) {
      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
    }

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

  const deleteBtn = (
    <Popconfirm
      alignEdge={false}
      placement="topRight"
      popup="删除后不可恢复"
      confirmText="删除"
      confirmButton={{
        intent: 'danger',
      }}
      onConfirm={() => {
        el.remove();
        setCurrentClickEl(null);
      }}
    >
      <Button theme="light" leftIcon="delete-outlined" size="small" />
    </Popconfirm>
  );

  return (
    <div
      className={cn(
        'absolute left-0 pt-2 px-4 pl-3 bg-white rounded shadow-inherit',
        // 调整间距模式下，隐藏 panel
        dimensionSwitch ? 'hidden' : ''
      )}
      style={{
        // 顶部位置写死 不算了
        top: top + 153,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        // Base.tsx 中对 window 上增加了 click 事件，用于清除 currentClickEl
        e.stopPropagation();
      }}
    >
      {type === 'image' && <PanelImage />}
      {type === 'carousel' && <PanelCarousel />}
    </div>
  );
};

export default Panel;
