import React from 'react';
import { Popconfirm, Button } from 'adui';
import { useStore } from '../stores';

const Remove = () => {
  const currentClickEl = useStore((state) => state.currentClickEl);
  const setCurrentClickEl = useStore((state) => state.setCurrentClickEl);
  const setCurrentContentInfo = useStore(
    (state) => state.setCurrentContentInfo
  );

  const handleMove = (direction: 'up' | 'down') => {
    const targetEl = currentClickEl as HTMLDivElement;
    const parentEl = targetEl.parentElement as HTMLElement;
    const siblingEl =
      direction === 'up'
        ? targetEl.previousElementSibling
        : targetEl.nextElementSibling;

    if (!siblingEl) {
      return;
    }

    if (direction === 'up') {
      parentEl.insertBefore(targetEl, siblingEl);
    } else {
      parentEl.insertBefore(targetEl, siblingEl.nextElementSibling);
    }

    setCurrentClickEl(null);
    setTimeout(() => {
      setCurrentClickEl(targetEl);
    }, 0);
  };

  const isFirstElement = currentClickEl?.previousElementSibling === null;
  const isLastElement = currentClickEl?.nextElementSibling === null;

  return (
    <div>
      {!isFirstElement && (
        <Button
          theme="light"
          leftIcon="arrow-back"
          size="small"
          className="rotate-90"
          onClick={() => {
            handleMove('up');
          }}
        />
      )}
      {!isLastElement && (
        <Button
          theme="light"
          leftIcon="arrow-back"
          size="small"
          className="-rotate-90"
          onClick={() => {
            handleMove('down');
          }}
        />
      )}
      <Popconfirm
        alignEdge={false}
        placement="topRight"
        popup="删除后不可恢复"
        confirmText="删除"
        confirmButton={{
          intent: 'danger',
        }}
        onConfirm={() => {
          setCurrentContentInfo(null);
          currentClickEl?.remove();
          setCurrentClickEl(null);
        }}
      >
        <Button theme="light" leftIcon="delete-outlined" size="small" />
      </Popconfirm>
    </div>
  );
};

export default Remove;
