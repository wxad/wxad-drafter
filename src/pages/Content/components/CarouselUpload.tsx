import React, { useEffect, useState } from 'react';
import { putPic, uploadFileBySource } from '../utils';
import { IPanel } from './Panel';

interface IInfoItem {
  el: SVGSVGElement;
  image: string;
}

interface ICarouselUploadItem {
  index: number;
  item: IInfoItem;
  onChange: (item: IInfoItem) => void;
}

const CarouselUploadItem: React.FC<ICarouselUploadItem> = ({
  item,
  index,
  onChange,
}) => {
  return (
    <div
      className="wxad-draft-panel-form-img"
      style={{
        backgroundImage: item.image,
      }}
    >
      <div
        className="wxad-draft-panel-form-img-hover"
        // style={{
        //   opacity: uploadState !== 'uploading' ? undefined : 0.4,
        //   pointerEvents: uploadState !== 'uploading' ? 'auto' : 'none',
        // }}
      >
        更改
        <input
          className="wxad-draft-panel-form-img-uploader"
          type="file"
          accept="image/*"
          title="更改"
          onChange={(e) => {
            // setUploadState('uploading');
            const file = e.target.files?.[0];

            const reset = () => {
              if (e.target) {
                e.target.value = '';
              }

              // setUploadState('error');
            };

            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const newItem = { ...item };
                const image = new Image();
                image.src = e.target?.result as string;
                image.onload = async () => {
                  const githubLinks = await putPic(file);
                  let mpLink = await uploadFileBySource(githubLinks[0]);

                  if (!mpLink) {
                    console.log('[yijie]', '上传第一次失败');
                    mpLink = await uploadFileBySource(githubLinks[1]);

                    if (!mpLink) {
                      console.log('[yijie]', '上传第二次失败');

                      mpLink = await uploadFileBySource(githubLinks[0]);

                      if (!mpLink) {
                        console.log('[yijie]', '上传第三次失败');
                        mpLink = await uploadFileBySource(githubLinks[1]);

                        if (!mpLink) {
                          console.log('[yijie]', '上传第四次失败');

                          reset();
                          return;
                        }
                      }
                    }
                  }

                  // setUploadState('idle');

                  newItem.image = `url(${mpLink})`;
                  newItem.el.style.backgroundImage = newItem.image;

                  onChange(newItem);
                };
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
      <div className="wxad-draft-panel-form-img-number">
        <span>{index + 1}</span>
      </div>
    </div>
  );
};

const CarouselUpload: React.FC<IPanel> = ({
  el,
  type,
  top,
  infos,
  onChange,
}) => {
  const items: IInfoItem[] = infos.carousel;

  const handleItemChange = (item: IInfoItem, index: number) => {
    const newInfos = { ...infos };
    newInfos.carousel[index] = item;
    onChange({
      el,
      type,
      top,
      infos: newInfos,
    });
  };

  return (
    <>
      <div className="wxad-draft-carousel-upload">
        {items.map((item, index) => (
          <CarouselUploadItem
            key={index}
            index={index}
            item={item}
            onChange={(item) => handleItemChange(item, index)}
          />
        ))}
      </div>
    </>
  );
};

export default CarouselUpload;
