// INTERFACES

export interface Coord {
  x: number;
  y: number;
}

export interface Time {
  s: string;
  m: string;
  h: string;
}

// ENUMS

export enum Direction {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}

export enum TimeDirection {
  forward = 'forward',
  backward = 'backward',
}

// TYPES

export type Path = Record<Direction, boolean>;

export type Callback = (e: CustomEvent) => void;
