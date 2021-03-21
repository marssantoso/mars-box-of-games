import { Board, Tile, Character, Bomb, Block, Coin } from './libs';
import Cursor from '../../libs/player';
import Timer from '../../libs/timer';
import { Path, Coord, Direction } from '../../types';

// elements
const header = document.getElementById('header');
const score = document.getElementById('score');

// create board
const board = new Board('board', 9, 5);

// set initial spawn point
const spawnTile = new Tile(header, 0, -1, 'spawnTile');
const nextPath = new Tile(header, 4, -1, 'nextPath');
const spawnPath: Path = { top: false, right: false, bottom: true, left: false };
spawnTile.pave(spawnPath);

// create all game objects
const character = new Character('character', board, spawnTile);
const cursor = new Cursor('cursor', board, board.tile(0, 0));
const bomb = new Bomb(board, 2);
new Block(board);
const coin = new Coin(board);
const time = new Timer('time');

// set initial score
score.textContent = 'Coin left: ' + coin.amount.toString();

// current and next path
let currentPath: Path;
const getNextPath = (): void => {
  currentPath = Tile.randomizePath();
  nextPath.pave(currentPath);
};
const placePath = ({ x, y }: Coord): void => {
  const tile = board.tile(x, y);
  if (!tile.isBlocked && !tile.isPaved) {
    tile.pave(currentPath);
    getNextPath();
  }
};
getNextPath();

// event handlers
board.tiles.forEach((row) => {
  row.forEach((tile) => {
    tile.el.addEventListener('click', () => {
      cursor.change(tile.coord);
      placePath(tile.coord);
    });
    tile.el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      cursor.change(tile.coord);
      bomb.place(tile.coord);
    });
  });
});

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      cursor.move(Direction.top);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      cursor.move(Direction.bottom);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      cursor.move(Direction.left);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      cursor.move(Direction.right);
      break;
    case 'x':
    case 'X':
      bomb.place(cursor.tile.coord);
      break;
    case ' ':
      e.preventDefault();
      placePath(cursor.tile.coord);
      break;
    default:
      break;
  }
});

character.on('coin', ({ detail }) => {
  const remaining = coin.amount - detail;
  score.textContent = remaining ? remaining.toString() : 'YOU WON';
  if (!remaining) time.stop();
});
