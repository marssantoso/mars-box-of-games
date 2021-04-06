import DefaultTile from '../../libs/tile';
import DefaultBoard from '../../libs/board';
import { create2dArray, flatten, sampleSize } from '../../utils';
import { Coord } from '../../types';

export class Board extends DefaultBoard {
  public tiles: Tile[][];

  constructor(elementId: string, rows: number, cols: number, size?: number) {
    super(elementId, rows, cols, size);
  }

  protected render(): void {
    this.tiles = create2dArray(this.rows, this.cols).map((row) => {
      return row.map(({ x, y }: Coord) => new Tile(this, this.el, x, y));
    });
  }

  public tile(x: number, y: number): Tile | null {
    return this.el !== null ? this.tiles[y][x] : null;
  }

  public update(): void {
    this.emit('update', null);
    if (this.isCleared) this.emit('clear', null);
  }

  public destroy(): void {
    this.emit('destroy', null);
  }

  public get flatTiles(): Tile[] {
    return flatten(this.tiles);
  }

  public get flagTiles(): Tile[] {
    return this.flatTiles.filter(({ isFlagged }) => isFlagged);
  }

  public get mineTiles(): Tile[] {
    return this.flatTiles.filter(({ hasMine }) => hasMine);
  }

  public get isCleared(): boolean {
    return this.flatTiles.every((tile) => tile.hasMine && tile.isFlagged || tile.isRevealed);
  }
}

export class Tile extends DefaultTile {
  public isRevealed = false;
  public isFlagged = false;
  public hasMine = false;
  public ctx: Board;
  public mine: Mine = null;

  // TODO: refactor base tile class to accept Board as context
  constructor(ctx: Board, board: HTMLElement | null, x: number, y: number, id?: string) {
    super(board, x, y, id);
    this.ctx = ctx;
  }

  public placeMine(mine: Mine): void {
    this.mine = mine;
    this.hasMine = true;
  }

  public removeMine(): void {
    this.hasMine = false;
    this.mine = null;
  }

  public reveal(): void {
    if (this.isFlagged || this.isRevealed) return;
    if (this.hasMine) return this.mine.detonate();

    const mines = this.neighborMines.length;
    this.el.textContent = mines ? mines.toString() : '';
    this.el.dataset.mines = mines.toString();
    this.el.classList.add('revealed');
    this.isRevealed = true;
    this.ctx.update();
    if (mines) return;

    this.neighbors.forEach((tile) => tile.reveal());
  }

  public revealAll(): void {
    if (this.isFlagged || this.neighborMines.length !== this.neighborFlags.length) return;
    this.neighbors.forEach((tile) => tile.reveal());
  }

  public flag(): void {
    if (this.isRevealed) return;
    this.isFlagged = !this.isFlagged;

    if (this.isFlagged) this.el.classList.add('flag');
    else this.el.classList.remove('flag');
    this.ctx.update();
  }

  public get neighbors(): Tile[] {
    return flatten(create2dArray(3, 3))
      .map(({ x, y }) => ({ x: x + this.coord.x - 1, y: y + this.coord.y - 1 }))
      .filter(({ x, y }) => x !== this.coord.x || y !== this.coord.y)
      .filter((coord) => this.ctx.has(coord))
      .map(({ x, y }) => this.ctx.tile(x, y));
  }

  public get neighborMines(): Tile[] {
    return this.neighbors.filter((tile) => tile.hasMine);
  }

  public get neighborFlags(): Tile[] {
    return this.neighbors.filter(({ isFlagged }) => isFlagged);
  }
}

export class Mine {
  public board: Board;
  public amount: number;
  public tiles: Tile[] = [];

  protected isSeeded = false;

  constructor(board: Board, amount: number) {
    this.board = board;
    this.amount = amount >= this.board.flatTiles.length ? this.board.flatTiles.length - 1 : amount;
  }

  protected populate(): void {
    this.tiles = sampleSize(this.board.flatTiles, this.amount);
    this.tiles.forEach((tile) => tile.placeMine(this));
  }

  protected clear(): void {
    this.tiles.forEach((tile) => tile.removeMine());
  }

  public seed(intialCoord: Coord): void {
    if (this.isSeeded) return;

    this.populate();
    if (this.board.tile(intialCoord.x, intialCoord.y).hasMine) {
      this.clear();
      return this.seed(intialCoord);
    }
    this.isSeeded = true;
  }

  public detonate(): void {
    this.tiles.forEach((tile) => {
      tile.isRevealed = true;
      tile.el.classList.add('mine');
    });
    this.board.destroy();
  }
}
