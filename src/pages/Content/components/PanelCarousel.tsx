import React from 'react';
import { IContentInfo, useStore } from '../stores';
import { putPic, uploadFileBySource } from '../utils';
import PanelToolbar from './PanelToolbar';

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
      className="group relative block w-16 h-16 bg-cover bg-center border border-solid border-[hsl(240_5.9%_90%)] rounded overflow-hidden cursor-pointer"
      style={{
        backgroundImage: item.image,
      }}
    >
      <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full font-semibold text-xs text-white bg-black bg-opacity-80 invisible group-hover:visible">
        更改
        <input
          className="absolute top-0 left-0 w-full h-full opacity-0"
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
      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-xs font-medium text-white bg-black bg-opacity-80 rounded-full">
        <span className="scale-[0.8]">{index + 1}</span>
      </div>
    </div>
  );
};

const PanelCarousel: React.FC = () => {
  const currentContentInfo = useStore((state) => state.currentContentInfo);
  const setCurrentContentInfo = useStore(
    (state) => state.setCurrentContentInfo
  );
  const { el, type, top, infos } = currentContentInfo as IContentInfo;
  const items: IInfoItem[] = infos.carousel;

  const handleItemChange = (item: IInfoItem, index: number) => {
    const newInfos = { ...infos };
    newInfos.carousel[index] = item;
    setCurrentContentInfo({
      el,
      type,
      top,
      infos: newInfos,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3 font-semibold text-sm">
        <div>横滑</div>
        <PanelToolbar />
      </div>
      <div className="flex mb-3">
        <div className="mr-2 pt-[2px] text-xs">
          图片
          <div className="scale-90 opacity-50">{`<5M`}</div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="grid w-fit grid-cols-2 gap-2">
            {items.map((item, index) => (
              <CarouselUploadItem
                key={index}
                index={index}
                item={item}
                onChange={(item) => handleItemChange(item, index)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelCarousel;
