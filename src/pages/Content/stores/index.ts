import { create } from 'zustand';

export interface ICurrentBlockStates {
  x: number;
  y: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  width: number;
  height: number;
  currentEl: HTMLDivElement | null;
  editing: boolean;
}

export interface IContentInfo {
  el: HTMLDivElement;
  type: string | null;
  top: number;
  infos: {
      [key: string]: any;
  };
}

const useStore = create<{
  currentBlockStates: ICurrentBlockStates;
  setCurrentBlockStates: (states: Partial<ICurrentBlockStates>) => void;

  leftPanelEl: HTMLDivElement | null;
  setLeftPanelEl: (el: HTMLDivElement | null) => void;

  editorEl: HTMLDivElement | null;
  setEditorEl: (el: HTMLDivElement | null) => void;

  eduiEl: HTMLDivElement | null;
  setEduiEl: (el: HTMLDivElement | null) => void;

  toolBarEl: HTMLDivElement | null;
  setToolBarEl: (el: HTMLDivElement | null) => void;

  bottomToolBarEl: HTMLDivElement | null;
  setBottomToolBarEl: (el: HTMLDivElement | null) => void;

  iframeEl: HTMLIFrameElement | null;
  setIframeEl: (el: HTMLIFrameElement | null) => void;

  dimensionSwitch: boolean;
  setDimensionSwitch: (value: boolean) => void;

  contentInfos: IContentInfo[]
  setContentInfos: (infos: IContentInfo[]) => void;

}>()((set) => ({
  currentBlockStates: {
    x: 0,
    y: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    width: 0,
    height: 0,
    currentEl: null,
    editing: false,
  },
  setCurrentBlockStates: (states) =>
    set((s) => ({
      currentBlockStates: { ...s.currentBlockStates, ...states },
    })),

  leftPanelEl: null,
  setLeftPanelEl: (el) => set({ leftPanelEl: el }),

  editorEl: null,
  setEditorEl: (el) => set({ editorEl: el }),

  eduiEl: null,
  setEduiEl: (el) => set({ eduiEl: el }),

  toolBarEl: null,
  setToolBarEl: (el) => set({ toolBarEl: el }),

  bottomToolBarEl: null,
  setBottomToolBarEl: (el) => set({ bottomToolBarEl: el }),

  iframeEl: null,
  setIframeEl: (el) => set({ iframeEl: el }),

  dimensionSwitch: false,
  setDimensionSwitch: (value) => set({ dimensionSwitch: value }),

  contentInfos: [],
  setContentInfos: (infos) => set({ contentInfos: infos }),
}));

export { useStore };