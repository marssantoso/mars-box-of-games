import Board from './board';
import Tile from './tile';
import { Coord, Direction, Callback } from '../types';

export default class Player {
  public name: string;
  public board: Board;
  public tile: Tile;

  constructor(name: string, board: Board, spawnTile: Tile) {
    this.name = name;
    this.board = board;
    this.tile = spawnTile;
    this.move();
  }

  public static nextCoord(coord: Coord, direction: Direction): Coord {
    let { x, y } = coord;
    x += direction === Direction.left ? -1 : direction === Direction.right ? 1 : 0;
    y += direction === Direction.top ? -1 : direction === Direction.bottom ? 1 : 0;
    return { x, y };
  }

  protected isAllowed(coord: Coord): boolean {
    return this.board.has(coord);
  }

  protected emit(event: string, detail: unknown): void {
    this.board.el.dispatchEvent(new CustomEvent(event, { detail }));
  }

  public on(event: string, handler: Callback): void {
    return this.board.el.addEventListener(event, (e) => {
      if (!('detail' in e)) return;
      handler((e));
    });
  }

  public move(direction?: Direction): void {
    const nextCoord = Player.nextCoord(this.tile.coord, direction);
    this.change(this.isAllowed(nextCoord) ? nextCoord : this.tile.coord);
  }

  public change(next: Coord): void {
    const prevTile = document.querySelector(`.tile[data-x="${this.tile.coord.x}"][data-y="${this.tile.coord.y}"]`);
    const nextTile = document.querySelector(`.tile[data-x="${next.x}"][data-y="${next.y}"]`);

    if (!prevTile || !nextTile) return;
    prevTile.classList.remove(this.name);
    nextTile.classList.add(this.name);

    this.tile = this.isAllowed(next) ? this.board.tile(next.x, next.y) : this.tile;
  }
}
