import React, { useEffect, useState } from 'react';
import { IContentInfo, useStore } from '../stores';
import { putPic, uploadFileBySource } from '../utils';
import CarouselUpload from './CarouselUpload';
import Input from './Input';
import Switch from './Switch';

export interface IPanel extends IContentInfo {
  onChange: (info: IContentInfo) => void;
}

const Panel: React.FC<IPanel> = (props) => {
  const dimensionSwitch = useStore((state) => state.dimensionSwitch);
  const { el, type, top, infos, onChange } = props;
  const [checked, setChecked] = useState(!!infos.link);
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
    // setChecked(!!infos.link);
  }, [infos.link]);

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

  return (
    <div
      className="wxad-draft-panel"
      style={{
        // 顶部位置写死 不算了
        top: top + 153,
        // 调整间距模式下，隐藏 panel
        display: dimensionSwitch ? 'none' : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {type === 'image' && (
        <>
          <div className="wxad-draft-panel-form">
            <div className="wxad-draft-panel-form-label">
              图片
              <div
                style={{ fontSize: '12px', scale: 0.9, opacity: 0.5 }}
              >{`<5M`}</div>
            </div>
            <div className="wxad-draft-panel-form-control">
              <div
                className="wxad-draft-panel-form-img"
                style={{
                  backgroundImage: infos.image,
                }}
              >
                <div
                  className="wxad-draft-panel-form-img-hover"
                  style={{
                    opacity: uploadState !== 'uploading' ? undefined : 0.4,
                    pointerEvents:
                      uploadState !== 'uploading' ? 'auto' : 'none',
                  }}
                >
                  更改
                  <input
                    className="wxad-draft-panel-form-img-uploader"
                    type="file"
                    accept="image/*"
                    title="更改"
                    onChange={(e) => {
                      setUploadState('uploading');
                      const file = e.target.files?.[0];

                      const reset = () => {
                        if (e.target) {
                          e.target.value = '';
                        }

                        setUploadState('error');
                      };

                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const newInfos = { ...infos };
                          const image = new Image();
                          image.src = e.target?.result as string;
                          image.onload = async () => {
                            const githubLinks = await putPic(file);
                            // const githubLinks = [
                            //   'https://cdn.jsdelivr.net/gh/aragakey/files@main/2024/8/1726036304976.gif',
                            //   'https://wxa.wxs.qq.com/wxad-design/yijie/1726036304976.gif',
                            // ];
                            let mpLink = await uploadFileBySource(
                              githubLinks[0]
                            );

                            if (!mpLink) {
                              console.log('[yijie]', '上传第一次失败');
                              mpLink = await uploadFileBySource(githubLinks[1]);

                              if (!mpLink) {
                                console.log('[yijie]', '上传第二次失败');

                                mpLink = await uploadFileBySource(
                                  githubLinks[0]
                                );

                                if (!mpLink) {
                                  console.log('[yijie]', '上传第三次失败');
                                  mpLink = await uploadFileBySource(
                                    githubLinks[1]
                                  );

                                  if (!mpLink) {
                                    console.log('[yijie]', '上传第四次失败');

                                    reset();
                                    return;
                                  }
                                }
                              }
                            }

                            setUploadState('idle');

                            newInfos.width = `${image.width}`;
                            newInfos.height = `${image.height}`;

                            newInfos.image = `url(${mpLink})`;

                            onChange({
                              el,
                              type,
                              top,
                              infos: newInfos,
                            });

                            updateImage(
                              newInfos.image,
                              newInfos.width,
                              newInfos.height
                            );
                          };
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              {['error', 'uploading'].includes(uploadState) && (
                <div
                  className="wxad-draft-panel-form-img-text"
                  style={{
                    color: uploadState === 'uploading' ? '#999' : '#f46161',
                  }}
                >
                  {uploadState === 'uploading' ? '上传中...' : '上传失败'}
                </div>
              )}
            </div>
          </div>
          <div className="wxad-draft-panel-form">
            <div className="wxad-draft-panel-form-label">链接</div>
            <div className="wxad-draft-panel-form-control">
              <Switch
                style={{
                  width: 'fit-content',
                }}
                checked={checked}
                onChange={() => {
                  const newInfos = { ...infos };
                  if (newInfos.link) {
                    newInfos.link = '';
                  } else {
                    newInfos.link = 'https://';
                  }
                  setChecked(!!newInfos.link);
                  updateLink(newInfos.link);

                  onChange({
                    el,
                    type,
                    top,
                    infos: newInfos,
                  });
                }}
              />
              {checked && (
                <Input
                  value={infos.link || ''}
                  onChange={(value) => {
                    const newInfos = { ...infos };
                    newInfos.link = value;
                    updateLink(value);
                    onChange({
                      el,
                      type,
                      top,
                      infos: newInfos,
                    });
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}
      {type === 'carousel' && (
        <>
          <div className="wxad-draft-panel-form">
            <div className="wxad-draft-panel-form-label">
              图片
              <div
                style={{ fontSize: '12px', scale: 0.9, opacity: 0.5 }}
              >{`<5M`}</div>
            </div>
            <div className="wxad-draft-panel-form-control">
              <CarouselUpload {...props} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Panel;
