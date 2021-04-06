import { Board, Mine } from './libs';
import Timer from '../../libs/timer';

// elements
const mines = document.getElementById('mines');

// game objects
const board = new Board('board', 9, 9);
const mine = new Mine(board, 10);
const time = new Timer('time');

// header
const updateMines = () => {
  mines.textContent = `${board.flagTiles.length}/${mine.amount}`;
};
updateMines();

// events
board.flatTiles.forEach((tile) => {
  tile.on('mousedown', (e) => {
    e.preventDefault();
  });
  tile.on('click', () => {
    mine.seed(tile.coord);
    tile.reveal();
  });
  tile.on('contextmenu', (e) => {
    e.preventDefault();
    tile.flag();
  });
  tile.on('dblclick', (e) => {
    e.preventDefault();
    tile.revealAll();
  });
});

board.on('update', () => {
  updateMines();
});

board.on('clear', () => {
  mines.textContent = 'YOU WON';
  time.stop();
});

board.on('destroy', () => {
  mines.textContent = 'YOU LOST';
  time.stop();
});
