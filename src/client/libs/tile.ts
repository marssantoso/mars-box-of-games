import { Callback, Coord } from '../types';

export default class Tile {
  public board: HTMLElement | null;
  public coord: Coord;
  public id: string | undefined;
  public el: HTMLElement;

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

  protected emit(event: string, detail: unknown): void {
    this.el.dispatchEvent(new CustomEvent(event, { detail }));
  }

  public on(event: string, handler: Callback): void {
    return this.el.addEventListener(event, (e) => {
      if (!('detail' in e)) return;
      handler((e));
    });
  }
}
