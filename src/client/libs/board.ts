import Tile from './tile';
import { Callback, Coord } from '../types';
import { create2dArray } from '../utils';

export default class Board {
  protected rows: number;
  protected cols: number;
  public el: HTMLElement | null;
  public tiles: Tile[][];

  constructor(elementId: string, rows: number, cols: number, size = 100) {
    this.el = document.getElementById(elementId);
    this.rows = rows;
    this.cols = cols;

    if (this.el) {
      this.el.style.width = `${this.cols * size}px`;
      this.el.style.height = `${this.rows * size}px`;
      this.el.style.gridTemplate = `repeat(${this.rows}, 1fr) / repeat(${this.cols}, 1fr)`;
    }

    this.render();
  }

  protected render(): void {
    this.tiles = create2dArray(this.rows, this.cols).map((row) => {
      return row.map(({ x, y }: Coord) => new Tile(this.el, x, y));
    });
  }

  protected emit(event: string, detail: unknown): void {
    this.el.dispatchEvent(new CustomEvent(event, { detail }));
  }

  public on(event: string, handler: Callback): void {
    return this.el.addEventListener(event, (e) => {
      if (!('detail' in e)) return;
      handler((e));
    });
  }

  public has({ x, y }: Coord): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  public tile(x: number, y: number): Tile {
    return this.tiles[y][x];
  }
}
