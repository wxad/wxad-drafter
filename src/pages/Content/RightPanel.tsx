import React, { useEffect } from 'react';
import Panel from './components/Panel';
import { useStore } from './stores';
import { getComponentType, extractAttributeValue } from './utils';

const RightPanel = () => {
  const editorEl = useStore((state) => state.editorEl);
  const iframeEl = useStore((state) => state.iframeEl);
  const contentInfos = useStore((state) => state.contentInfos);
  const setContentInfos = useStore((state) => state.setContentInfos);

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

  return (
    <>
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
    </>
  );
};

export default RightPanel;
