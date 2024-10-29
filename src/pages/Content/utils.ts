import $ from 'jquery';
import axios from 'axios';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 右侧 Panel 挂载的元素
export const EDITOR_MAIN_ID = 'editor_pannel';
// 主 iFrame, id 是 ueditor_0，保险起见找 ueditor 开头的 iframe
export const IFRAME_ID = 'ueditor';
// 主 iFrame 外层 div，间距面板挂载的元素
export const EDUI_EDITOR_ID = 'edui';
// 左侧切换文章的面板，点击时 iframe 会刷新，因此需要重新定位元素
export const LEFT_PANEL_ID = 'js_side_article_list';
// js toolbar
export const JS_TOOLBAR_ID = 'js_toolbar';

// 判断是否是 svg 图片组件
export const isImageComponent = (element: Element): boolean => {
  return (
    element.outerHTML.includes('svg') &&
    element.outerHTML.includes('background-image') &&
    element.outerHTML.includes('viewBox')
  );
};

// 判断是否是横滑组件
export const isCarouselComponent = (element: Element): boolean => {
  return (
    element.outerHTML.includes('overflow-x') &&
    element.outerHTML.includes('foreignObject')
  );
};

// 判断是否是文字组件
export const isTextComponent = (element: Element): boolean => {
  return true
}

export const getComponentType = (element?: Element | null) => {
  if (!element) {
    return ""
  }
  if (isCarouselComponent(element)) {
    return 'carousel';
  }

  if (isImageComponent(element)) {
    return 'image';
  }

  if (isTextComponent(element)) {
    return 'text';
  }

  return "";
};

// 获取属性值，注意可能存在于子元素中，递归寻找
export function extractAttributeValue(
  outerHTML: string,
  attribute: string
): string | undefined {
  const parser = new DOMParser();
  const doc = parser.parseFromString(outerHTML, 'text/html');
  const elements = doc.body.getElementsByTagName('*');

  // 遍历所有元素
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // 检查当前元素是否具有指定的属性
    if (element.hasAttribute(attribute)) {
      return element.getAttribute(attribute) || undefined;
    }

    // 检查 style 属性中的 CSS 属性
    const style = element.getAttribute('style');
    if (style) {
      const styles = style.split(';');
      for (const styleRule of styles) {
        const [key, ...valueParts] = styleRule.split(':').map((s) => s.trim());
        const value = valueParts.join(':').trim(); // 处理可能存在的冒号
        if (key === attribute) {
          return value;
        }
      }
    }
  }

  // 如果没有找到，返回 undefined
  return undefined;
}

export const replaceValue = (
  el: HTMLDivElement,
  oldVal: string,
  newVal: string
) => {
  const outerHTML = el.outerHTML;

  el.outerHTML = outerHTML.replaceAll(oldVal, newVal);
};

const repo = 'aragakey/files';
const ts = [
  'g',
  'h',
  'p',
  '_',
  'l',
  'S',
  'N',
  'V',
  'x',
  'F',
  'O',
  'M',
  '7',
  '5',
  'Z',
  'l',
  '4',
  'r',
  'G',
  '0',
  'f',
  'M',
  '9',
  'y',
  'N',
  'I',
  'r',
  '9',
  't',
  'r',
  'P',
  'B',
  'M',
  '7',
  '1',
  'B',
  'v',
  'Z',
  'V',
  '4',
];

const reader = new FileReader();
function getBase64(file: File) {
  return new Promise((resolve) => {
    reader.onload = function (event) {
      const fileContent = event.target && event.target.result;
      resolve((fileContent as string).split(',')[1]);
    };
    reader.readAsDataURL(file);
  });
}

export const putPic = async (file: File): Promise<string[]> => {
  const d = new Date();
  const content = await getBase64(file);
  // 判断图片的格式
  const extra = file.type.replace('image/', '.');
  const path = `${d.getFullYear()}/${d.getMonth()}/${d.getTime()}${extra}`;
  const imageUrl = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  const body = { branch: 'main', message: 'upload', content, path };

  const res = await axios.put(imageUrl, body, {
    headers: {
      Authorization: `token ${ts.join('')}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  return [
    res.data.content.download_url,
    `https://cdn.jsdelivr.net/gh/aragakey/files@main/${path}`,
  ];
};

export const uploadFileBySource = async (src: string) => {
  console.log('[yijie]', src);
  const token = new URLSearchParams(window.location.search).get('token');
  var res = await $.ajax({
    url:
      'https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn?lang=zh_CN&token=' +
      token +
      '&t=' +
      Math.random(),
    type: 'POST',
    dataType: 'JSON',
    data: {
      imgurl: src,
      t: 'ajax-editor-upload-img',
      token,
      lang: 'zh_CN',
      f: 'json',
      ajax: '1',
    },
  });

  if (res.errcode !== 0) {
    return '';
  }
  return res.url as string;
};

export const componentLists = [
  {
    title: "基本区块",
    children: [
      {
        title: "文本",
        icon: "https://wxa.wxs.qq.com/wxad-design/yijie/notion-en-US.png",
        type: "text",
      },
    ]
  },
  {
    title: "媒体",
    children: [
      {
        title: "图片",
        icon: "https://wxa.wxs.qq.com/wxad-design/yijie/notion-en-US.png",
        type: "image",
      },
      {
        title: "横滑",
        icon: "https://wxa.wxs.qq.com/wxad-design/yijie/notion-en-US.png",
        type: "carousel",
      },
    ]
  }
]