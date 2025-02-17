import { Button, Dialog, Icon, Input, Menu, Message, Popover } from 'adui';
import axios from 'axios';
import * as cheerio from 'cheerio';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from './stores';

const getJsContent = async (url: string): Promise<string> => {
  try {
    // 发送 GET 请求
    const response = await axios.get(url);

    if (response.status === 200) {
      // 加载 HTML 内容到 cheerio
      const $ = cheerio.load(response.data);

      // 查找 id 为 js_content 的元素
      const jsContent = $('#js_content').html();

      if (jsContent) {
        console.log('获取成功，内容如下：\n', jsContent);
        return jsContent;
      } else {
        console.log('未找到 js_content 元素');
        return '';
      }
    } else {
      console.log(`请求失败，状态码：${response.status}`);
      return '';
    }
  } catch (error: any) {
    console.error('发生错误：', error.message);
    return '';
  }
};

const ToolPopover = () => {
  const bottomMainEl = useStore((state) => state.bottomMainEl);
  const [visible, setVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [url, setUrl] = useState('');

  const handleDownloadPost = () => {
    const targeIframe = document.querySelector(
      'iframe#ueditor_0'
    ) as HTMLIFrameElement;
    const body = targeIframe?.contentWindow?.document.body;
    // 把文章代码保存成xml文件并保存到本地
    const postContent = body?.innerHTML;
    if (postContent) {
      // 把代码中的&nbsp;替换成空格
      const postContentWithSpace = postContent.replace(/&nbsp;/g, ' ');
      const blob = new Blob([postContentWithSpace], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const titleEl = document.querySelector('#title') as HTMLInputElement;
      a.download = `${titleEl.value}.xml`;
      a.click();
    }
  };

  const handleReplacePageConfirm = async () => {
    const jsContent = await getJsContent(url);
    if (jsContent) {
      // 把获取到的内容替换到页面的 ueditor_0 iframe中的body innerHTML中
      const targeIframe = document.querySelector(
        'iframe#ueditor_0'
      ) as HTMLIFrameElement;
      const body = targeIframe?.contentWindow?.document.body;
      if (!body) {
        Message.warning('未找到编辑器，请检查页面是否正确');
        return;
      }
      body.innerHTML = jsContent;
      setDialogVisible(false);
      Message.success('替换成功');
    } else {
      Message.warning('获取页面失败');
    }
  };

  return (
    <>
      {bottomMainEl &&
        createPortal(
          <div className="absolute -right-[20px] transform translate-x-full top-[20px]">
            <Popover
              visible={visible}
              onVisibleChange={(bool) => setVisible(bool)}
              arrowed={false}
              placement="top"
              popup={
                <Menu
                  onItemClick={(index) => {
                    if (index === 'save_page') {
                      handleDownloadPost();
                    }
                    if (index === 'replace_page') {
                      setDialogVisible(true);
                    }
                    setVisible(false);
                  }}
                >
                  <Menu.Item index="save_page">保存页面</Menu.Item>
                  {/* <Menu.Item index="2">复制页面</Menu.Item> */}
                  <Menu.Item index="replace_page">替换当前页面</Menu.Item>
                </Menu>
              }
              trigger="click"
            >
              <Button active={visible}>
                <div className="flex items-center">
                  <Icon icon="heart" color="#07c160" className="mr-[4px]" />
                  WXAD
                </div>
              </Button>
            </Popover>
            <Dialog
              title="替换页面"
              visible={dialogVisible}
              onCancel={() => setDialogVisible(false)}
              onConfirm={handleReplacePageConfirm}
              confirmProps={{
                disabled: !url,
              }}
            >
              <div>
                <Input.Textarea
                  className="w-full"
                  value={url}
                  placeholder="请输入链接"
                  inputStyle={{ width: '100%', height: '120px' }}
                  onChange={({ target: { value: val } }) => {
                    console.log('👻👻👻 --- handleReplacePage --- val:', val);
                    setUrl(val);
                  }}
                />
              </div>
            </Dialog>
          </div>,
          bottomMainEl
        )}
    </>
  );
};

export default ToolPopover;
