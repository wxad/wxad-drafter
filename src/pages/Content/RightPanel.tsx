import { Button, Popover } from 'adui';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PanelCarousel from './components/PanelCarousel';
import PanelImage from './components/PanelImage';
import PanelText from './components/PanelText';
import { useStore } from './stores';
import {
  cn,
  componentLists,
  extractAttributeValue,
  getComponentType,
} from './utils';

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
  const setCurrentClickEl = useStore((state) => state.setCurrentClickEl);

  const currentHoverElType = getComponentType(currentHoverEl);
  const currentClickElType = getComponentType(currentClickEl);

  const isShowOutlineType = ['image', 'carousel'].includes(currentClickElType);

  const { type, top } = currentContentInfo || {};
  const addComponentPopupVisible = useStore(
    (state) => state.addComponentPopupVisible
  );
  const setAddComponentPopupVisible = useStore(
    (state) => state.setAddComponentPopupVisible
  );

  const handleAddComponent = (type: string) => {
    setAddComponentPopupVisible(false);

    if (currentHoverEl) {
      const newElement = document.createElement('p');
      newElement.innerText = 'New Text';
      newElement.style.marginLeft = '16px';
      newElement.style.marginRight = '16px';
      currentHoverEl.after(newElement);

      setCurrentClickEl(newElement);
    }
  };

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

      if (
        window.scrollY - 150 > rect.top ||
        window.scrollY + window.innerHeight < rect.top + 500
      ) {
        window.scrollTo({
          top: rect.top + 150,
          // behavior: 'smooth',
        });
      }

      const type = getComponentType(currentClickEl);
      let infos: { [key: string]: any } = {};

      if (type === 'image') {
        // 分为通过 mp 插入的图片和 svg 图片
        if (currentClickEl.outerHTML.includes('wxw-img')) {
          const imgEl = currentClickEl.querySelector(
            '.wxw-img'
          ) as HTMLImageElement;
          const { src, naturalWidth, naturalHeight } = imgEl;

          infos.viewBox = `0 0 ${naturalWidth} ${naturalHeight}`;
          infos.image = `url(${src})`;
          infos.radius = extractAttributeValue(
            currentClickEl.outerHTML,
            'border-radius'
          );
          infos.link = extractAttributeValue(currentClickEl.outerHTML, 'href');
        } else {
          infos.viewBox = extractAttributeValue(
            currentClickEl.outerHTML,
            'viewBox'
          );
          infos.image = extractAttributeValue(
            currentClickEl.outerHTML,
            'background-image'
          );

          infos.radius = extractAttributeValue(
            currentClickEl.outerHTML,
            'border-radius'
          );
          infos.link = extractAttributeValue(currentClickEl.outerHTML, 'href');
        }
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

    // hover 到其他元素时，隐藏 popup
    setAddComponentPopupVisible(false);

    return () => {
      if (currentHoverEl) {
        currentHoverEl.style.cursor = '';
      }
    };
  }, [currentHoverEl]);

  // 从 currentHoverEl 派生出一些位置信息与状态
  let currentHoverStates = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  // 从 currentClickEl 派生出一些位置信息与状态
  let currentClickStates = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  if (currentHoverEl && iframeEl && editorEl && eduiEl && !dimensionSwitch) {
    const targetRect = currentHoverEl.getBoundingClientRect();
    const iframeRect = iframeEl.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();
    const eduiRect = eduiEl.getBoundingClientRect();

    currentHoverStates = {
      x: targetRect.left + editorRect.left - eduiRect.left,
      y: targetRect.top + iframeRect.top - eduiRect.top,
      width: targetRect.width,
      height: targetRect.height,
    };
  }

  if (currentClickEl && iframeEl && editorEl && eduiEl && !dimensionSwitch) {
    const targetRect = currentClickEl.getBoundingClientRect();
    const iframeRect = iframeEl.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();
    const eduiRect = eduiEl.getBoundingClientRect();

    currentClickStates = {
      x: targetRect.left + editorRect.left - eduiRect.left,
      y: targetRect.top + iframeRect.top - eduiRect.top,
      width: targetRect.width,
      height: targetRect.height,
    };
  }

  return (
    <>
      {editorEl && currentContentInfo && (
        <div
          className={cn(
            'absolute left-0 pt-2 px-4 pl-3 bg-white rounded',
            // 调整间距模式下，隐藏 panel
            dimensionSwitch ? 'hidden' : ''
          )}
          style={{
            // 顶部位置写死 不算了
            top: (top || 0) + 153,
            boxShadow: '0 1px 5px 0 rgba(0, 0, 0, 0.05)',
          }}
          onClick={(e) => {
            // Base.tsx 中对 window 上增加了 click 事件，用于清除 currentClickEl
            e.stopPropagation();
          }}
        >
          {type === 'text' && <PanelText />}
          {type === 'image' && <PanelImage />}
          {type === 'carousel' && <PanelCarousel />}
        </div>
      )}
      {/* hover 态 */}
      {eduiEl &&
        currentHoverEl &&
        !dimensionSwitch &&
        createPortal(
          <div
            className={cn(
              'absolute z-[117] pointer-events-none',
              currentHoverElType !== 'text' && 'bg-[#4597f8] bg-opacity-10'
            )}
            // onClick={(e) => e.stopPropagation()}
            style={{
              top: currentHoverStates.y,
              left: currentHoverStates.x,
              width: currentHoverStates.width,
              height: currentHoverStates.height,
            }}
          >
            <div className="absolute top-0 right-full flex items-center pr-1 pointer-events-auto">
              <Popover
                arrowed={false}
                getPopupContainer={(trigger) =>
                  trigger.parentNode as HTMLElement
                }
                trigger="click"
                visible={addComponentPopupVisible}
                onVisibleChange={setAddComponentPopupVisible}
                placement="bottom"
                popup={
                  <div className="py-2 w-[150px]">
                    {componentLists.map((cp, index) => (
                      <div
                        key={cp.title}
                        className={cn(
                          index !== componentLists.length - 1 && 'mb-1'
                        )}
                      >
                        <div
                          className={cn(
                            'mb-1 px-2 text-xs font-medium text-neutral-400',
                            index !== 0 &&
                              'pt-2 border-t border-solid border-neutral-200'
                          )}
                        >
                          {cp.title}
                        </div>
                        <div className="mb-1">
                          {cp.children.map((child) => (
                            <div
                              key={child.type}
                              className="flex items-center mx-1 p-1 rounded cursor-pointer hover:bg-neutral-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddComponent(child.type);
                              }}
                            >
                              <img
                                src={child.icon}
                                alt=""
                                className="mr-2 flex-none w-8 h-8 rounded border border-solid border-neutral-200"
                              />
                              <div className="text-[13px]">{child.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <Button
                  className="opacity-60"
                  leftIcon="add"
                  size="mini"
                  theme="light"
                  active={addComponentPopupVisible}
                />
              </Popover>
              {/* <Button
                className="opacity-60"
                leftIcon="draggable"
                size="mini"
                theme="light"
                style={{
                  cursor: 'grab',
                }}
                draggable
                onDragStart={(e: DragEvent) => {
                  if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                    // setDraggingComponent(field);
                    // 复制一个和 currentHoverEl 一样的元素，作为 drag 的 ghost 元素
                    const ghost = currentHoverEl.cloneNode(true) as HTMLElement;
                  }
                }}
                onDragEnd={() => {
                  // setDraggingComponent(null);
                }}
              /> */}
            </div>
          </div>,
          eduiEl
        )}
      {/* click 态 */}
      {eduiEl &&
        currentClickEl &&
        !dimensionSwitch &&
        createPortal(
          <div
            className={cn(
              'absolute z-[117] pointer-events-none',
              isShowOutlineType && 'outline-[2px] outline outline-[#07c160]'
            )}
            style={{
              top: currentClickStates.y,
              left: currentClickStates.x,
              width: currentClickStates.width,
              height: currentClickStates.height,
            }}
          ></div>,
          eduiEl
        )}
    </>
  );
};

export default RightPanel;
