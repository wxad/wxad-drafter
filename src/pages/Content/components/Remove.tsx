import React from 'react';
import { Popconfirm, Button } from 'adui';
import { useStore } from '../stores';

const Remove = () => {
  const currentClickEl = useStore((state) => state.currentClickEl);
  const setCurrentClickEl = useStore((state) => state.setCurrentClickEl);
  const setCurrentContentInfo = useStore(
    (state) => state.setCurrentContentInfo
  );

  return (
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
  );
};

export default Remove;
