import { Coord } from '../types';
import Player from './player';

export default class Tile {
  public board: HTMLElement | null;
  public coord: Coord;
  public id: string | undefined;
  public el: HTMLElement;
  public player: Player | null = null;

  constructor(board: HTMLElement | null, x: number, y: number, id?: string) {
    this.board = board;
    this.coord = { x, y };
    this.id = id;
    this.render(id);
  }

  protected render(id: string): void {
    if (!this.board) return;
    this.el = document.createElement('div');
    this.el.className = 'tile';
    this.el.dataset.x = this.coord.x.toString();
    this.el.dataset.y = this.coord.y.toString();
    // this.el.textContent = `{ ${this.coord.x}, ${this.coord.y} }`;
    if (id) this.el.id = id;

    this.board.appendChild(this.el);
  }

  public enter(player: Player): void {
    this.player = player;
  }

  public leave(): void {
    this.player = null;
  }

  get isOccupied(): boolean {
    return this.player !== null;
  }
}
