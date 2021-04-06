import DefaultTile from '../../libs/tile';
import DefaultBoard from '../../libs/board';
import DefaultPlayer from '../../libs/player';
import DefaultBomb from '../../libs/bomb';

import { Coord, Direction, Path } from '../../types';
import { create2dArray, sampleSize, flatten } from '../../utils';

export class Board extends DefaultBoard {
  public tiles: Tile[][];

  constructor(elementId: string, rows: number, cols: number, size?: number) {
    super(elementId, rows, cols, size);
  }

  protected render(): void {
    this.tiles = create2dArray(this.rows, this.cols).map((row) => {
      return row.map(({ x, y }: Coord) => new Tile(this.el, x, y));
    });
  }

  public tile(x: number, y: number): Tile | null {
    return this.el !== null ? this.tiles[y][x] : null;
  }
}

export class Tile extends DefaultTile {
  public isBlocked = false;
  public hasCoin = false;
  public path: Path = Tile.defaultPath;
  public player: Character | null = null;

  public static directions: Direction[] = [Direction.top, Direction.right, Direction.bottom, Direction.left];
  public static defaultPath: Path = { top: false, right: false, bottom: false, left: false };

  constructor(board: HTMLElement | null, x: number, y: number, id?: string) {
    super(board, x, y, id);
    this.pave(this.path);
  }

  private static encodePath(path: Path): string {
    return Tile.directions.map((direction) => Number(path[direction])).join('');
  }

  public static randomizePath(): Path {
    const [source, dest] = sampleSize(Tile.directions, 2);
    const path: Path = [...Tile.directions].reduce((prev, curr) => {
      return { ...prev, [curr]: curr === source || curr === dest };
    }, Tile.defaultPath);
    return path;
  }

  public block(): void {
    this.isBlocked = true;
    this.el.classList.add('blocked');
  }

  public pave(path: Path): void {
    if (!this.board) return;
    this.path = path;
    this.el.dataset.path = Tile.encodePath(path);
  }

  public unpave(): void {
    this.pave(Tile.defaultPath);
  }

  public addCoin(): void {
    this.hasCoin = true;
    this.el.classList.add('coin');
  }

  public removeCoin(): void {
    this.hasCoin = false;
    this.el.classList.remove('coin');
  }

  public enter(player: Character): void {
    this.player = player;
  }

  public leave(): void {
    this.player = null;
  }

  get isOccupied(): boolean {
    return this.player !== null;
  }

  get isPaved(): boolean {
    return Object.values(this.path).includes(true);
  }

  get connections(): Direction[] {
    return Object.entries(this.path)
      .filter(([, value]) => value)
      .map(([direction]) => Direction[direction]);
  }
}

export class Character extends DefaultPlayer {
  protected spawnTile: Tile;
  protected spawnDirection: Direction;
  public board: Board;
  public tile: Tile;
  public direction: Direction;
  public score = 0;

  constructor(name: string, board: Board, spawnTile: Tile, spawnDirection = Direction.bottom) {
    super(name, board, spawnTile);
    this.spawnTile = spawnTile;
    this.spawnDirection = spawnDirection;
    this.direction = spawnDirection;
    this.start();
  }

  protected isAllowed(coord: Coord): boolean {
    return this.board.has(coord) && !this.board.tile(coord.x, coord.y).isBlocked;
  }

  public start(): void {
    if (this.connected) {
      const [newDirection] = this.neighbor.connections.filter((direction) => direction !== this.connection);
      this.leave();
      this.move(this.direction);
      this.takeCoin();
      this.enter(newDirection);
    }
    setTimeout(() => this.start(), 500);
  }

  public destroy(): void {
    this.leave();
    this.change(this.spawnTile.coord);
    this.tile = this.spawnTile;
    this.direction = this.spawnDirection;
  }

  public leave(): void {
    this.tile.leave();
    this.tile.el.classList.remove(`${this.name}--${this.direction}`);
  }

  public enter(newDirection: Direction): void {
    this.tile.enter(this);
    this.tile.el.classList.add(`${this.name}--${newDirection}`);
    this.direction = newDirection;
  }

  public takeCoin(): void {
    if (this.tile.hasCoin) {
      this.tile.removeCoin();
      this.score++;
      this.emit('coin', this.score);
    }
  }

  get neighbor(): Tile {
    const nextCoord = DefaultPlayer.nextCoord(this.tile.coord, this.direction);
    return this.board.has(nextCoord) ? this.board.tile(nextCoord.x, nextCoord.y) : null;
  }

  get connection(): Direction {
    return {
      [Direction.top]: Direction.bottom,
      [Direction.right]: Direction.left,
      [Direction.bottom]: Direction.top,
      [Direction.left]: Direction.right,
    }[this.direction];
  }

  get connected(): boolean {
    return this.neighbor?.path[this.connection];
  }
}

export class Bomb extends DefaultBomb {
  public board: Board;

  constructor(board: Board, size: number, countdown?: number) {
    super(board, size, countdown);
  }

  protected canRender(coord: Coord): boolean {
    return this.board.has(coord) && !this.board.tile(coord.x, coord.y).isBlocked;
  }

  protected detonate(coord: Coord): void {
    super.detonate(coord);
    const tile = this.board.tile(coord.x, coord.y);
    tile.unpave();
    if (tile.isOccupied) tile.player.destroy();
  }
}

export class Block {
  public board: Board;
  public tiles: Tile[];

  constructor(board: Board) {
    this.board = board;
    this.tiles = this.randomizeBlock();
    this.render();
  }

  protected randomizeBlock(): Tile[] {
    const [randomPreset] = sampleSize(Block.presets, 1);
    return randomPreset.map(({ x, y }) => this.board.tile(x, y));
  }

  protected render(): void {
    this.tiles.forEach((tile) => tile.block());
  }

  static presets: Coord[][] = [
    [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 1, y: 5 },
      { x: 3, y: 5 },
      { x: 1, y: 7 },
      { x: 3, y: 7 },
    ],
    [
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 0, y: 7 },
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 0, y: 8 },
      { x: 1, y: 8 },
      { x: 2, y: 8 },
    ],
    [
      { x: 2, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 2, y: 6 },
    ],
    [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 0, y: 5 },
      { x: 0, y: 6 },
      { x: 0, y: 7 },
      { x: 1, y: 5 },
      { x: 1, y: 6 },
      { x: 1, y: 7 },
    ],
  ];
}

export class Coin {
  public board: Board;
  public amount: number;
  public remaining: number;

  constructor(board: Board) {
    this.board = board;
    this.amount = Math.floor(Math.random() * 10) + 10;
    this.remaining = this.amount;
    this.spread();
  }

  protected spread(): void {
    sampleSize(flatten(this.board.tiles).filter(({ isBlocked }) => !isBlocked), this.amount)
      .forEach(({ coord }) => this.board.tile(coord.x, coord.y).addCoin());
  }
}
