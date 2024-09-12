import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { EDITOR_MAIN_ID } from './utils';

const root = document.createElement('div');
root.id = 'wxad-draft-root';

// 默认是 hidden，由于面板在右侧，这里保证页面可以横向滚动
document.body.style.setProperty('overflow-x', 'auto', 'important');
document.body.insertBefore(root, document.body.firstChild);

const handleResize = () => {
  const editor = document.getElementById(EDITOR_MAIN_ID);

  if (editor) {
    const editorRect = editor.getBoundingClientRect();
    root.style.left = `${editorRect.width + editorRect.left + 12}px`;
  }
};

window.addEventListener('resize', handleResize);
handleResize();

ReactDOM.render(<App />, root);
