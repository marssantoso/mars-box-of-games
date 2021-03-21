import Board from './board';
import { Coord } from '../types';
import { create2dArray, flatten } from '../utils';

export default class Bomb {
  public board: Board;
  public radius: number;
  public size: number;
  public countdown: number;

  protected tiles: Coord[][];

  constructor(board: Board, size: number, countdown = 1000) {
    this.board = board;
    this.radius = size - 1;
    this.size = this.radius * 2 + 1;
    this.tiles = create2dArray(this.size, this.size);
    this.countdown = countdown;
  }

  protected canRender(coord: Coord): boolean {
    return this.board.has(coord);
  }

  protected render(coord: Coord): void {
    if (!this.canRender(coord)) return;
    document.querySelector(`.tile[data-x="${coord.x}"][data-y="${coord.y}"]`).classList.add('bomb');
    setTimeout(() => this.detonate(coord), this.countdown);
  }

  protected detonate(coord: Coord): void {
    document.querySelector(`.tile[data-x="${coord.x}"][data-y="${coord.y}"]`).classList.remove('bomb');
  }

  public place(coord: Coord): void {
    const minX = coord.x - this.radius;
    const minY = coord.y - this.radius;
    const tiles = this.tiles.map((y) => y.map(({ x, y }) => ({ x: x + minX, y: y + minY })));
    flatten(tiles).forEach((coord) => this.render(coord));
  }
}
