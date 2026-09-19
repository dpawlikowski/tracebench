declare module "react-grid-layout" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export type Layout = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
  };

  export type Layouts = Record<string, Layout[]>;

  export type GridLayoutProps = {
    className?: string;
    style?: CSSProperties;
    width?: number;
    layout?: Layout[];
    cols?: number;
    rowHeight?: number;
    maxRows?: number;
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    isDraggable?: boolean;
    isResizable?: boolean;
    isBounded?: boolean;
    useCSSTransforms?: boolean;
    compactType?: "vertical" | "horizontal" | null;
    preventCollision?: boolean;
    draggableHandle?: string;
    draggableCancel?: string;
    onLayoutChange?: (layout: Layout[]) => void;
    children?: ReactNode;
  };

  declare const GridLayout: ComponentType<GridLayoutProps>;
  export default GridLayout;

  export function WidthProvider<P>(
    component: ComponentType<P>,
  ): ComponentType<Omit<P, "width">>;
}

declare module "react-grid-layout/css/styles.css";
declare module "react-resizable/css/styles.css";
