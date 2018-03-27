import { Injectable } from '@angular/core';
import { Board } from './board/board.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GameState, GameStateModel } from './board/game-state.model';
import { map } from 'rxjs/operators';

const NEIGHBORHOOD: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]
];

export const DEFAULT_WIDTH = 8;
export const DEFAULT_HEIGHT = 8;
export const DEFAULT_MINES = 10;

@Injectable()
export class BoardService {
  private state = new BehaviorSubject<GameStateModel>(null);
  private timeSubscription: Subscription;
  board$ = this.state.pipe(
    map(state => state.board)
  );
  time$ = this.state.pipe(
    map(state => state.time)
  );
  minesRemain$ = this.state.pipe(
    map(state => state.minesRemain)
  );
  gameState$ = this.state.pipe(
    map(state => state.state)
  );

  static setCellValue(board: Board): Board {
    return {
      ...board,
      cells: board.cells.map(
        (row, y) => row.map(
          (cell, x) => ({...cell, value: BoardService.setVal(board, x, y)})
        )
      )
    };
  }

  static setVal(board: Board, x: number, y: number): number {
    return NEIGHBORHOOD
      .map(([vy, vx]) => [y + vy, x + vx])
      .filter(([y, x]) => x >= 0 && y >= 0 && x < board.width && y < board.height)
      .map(([y, x]) => board.cells[y][x].mined ? 1 : 0)
      .reduce((acc, value) => acc + value, 0);
  }

  constructor() {
    this.resetGame(DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_MINES);
  }

  createBoard(width: number, height: number, mineCount: number): void {
    const state = this.state.getValue();
    let mines: [number, number][];
    mines = this.placeMines(width, height, mineCount);

    const newBoard: Board = {
      height: height,
      width: width,
      cells: new Array(height)
        .fill(0)
        .map((_, y) => new Array(width)
          .fill(0)
          .map((__, x) => ({
            value: 0,
            shown: false,
            flagged: false,
            mined: this.contains(mines, [x, y])
          }))
        )
    };

    const filledBoard = BoardService.setCellValue(newBoard);
    this.state.next({
      ...state,
            board: filledBoard
    });
  }

  private contains(mineArray: [number, number][], mine: [number, number]): boolean {
    return mineArray.some(m => mine[0] === m[0] && mine[1] === m[1]);
  }

  placeMines(boardWidth: number, boardHeight: number, mineCount: number): [number, number][] {
    const mines: [number, number][] = [];
    for (let x = 0; x < mineCount; x++) {
      let xy: [number, number];
      do {
        xy = [
          Math.floor(Math.random() * boardHeight),
          Math.floor(Math.random() * boardWidth)
        ];
      } while (this.contains(mines, xy));
      mines.push(xy);
    }
    return mines;
  }

  uncoverMultipleCells(y: number, x: number): void {
    const state = this.state.getValue();
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if ((i === y && j === x)
          || (i < 0)
          || (j < 0)
          || (i > state.board.height - 1)
          || (j > state.board.width - 1)) {
          continue;
        }
        if (!state.board.cells[i][j].shown
          && !state.board.cells[i][j].mined) {
          this.uncoverCell(i, j);
        }
      }
    }
  }

  uncoverCell(y: number, x: number): void {
    const state = this.state.getValue();
    if (state.board.cells[y][x].flagged) {
      return;
    }
    this.state.next({
      ...state,
      board: {
        ...state.board,
        cells: state.board.cells.map(
        (row, dy) => row.map(
          (cell, dx) => (dx === x && dy === y ? {...cell, shown: true} : cell)
        )
      )}
    });
    if (state.board.cells[y][x].mined) {
      this.endGame();
      return;
    }
    if (state.board.cells[y][x].value === 0) {
      this.uncoverMultipleCells(y, x);
    }
  }

  winner(): void {
    const state = this.state.getValue();
    if (this.amIWinner()) {
      this.state.next({
        ...state,
        state: GameState.won
      });
      this.timeSubscription.unsubscribe();
    }
  }

  endGame(): void {
    const state = this.state.getValue();
    this.state.next({
      ...state,
      board: {
      ...state.board,
      cells: state.board.cells.map(
        (row) => row.map(
          (cell) => ({...cell, shown: (cell.mined || cell.shown) || (cell.flagged && !cell.mined)})
        )
      )},
      state: GameState.lost
    });

    this.timeSubscription.unsubscribe();
  }

  amIWinner(): boolean {
    const state = this.state.getValue();
    return this.state.getValue().board.cells.every(
      (row, y) => row.every(
        (cell, x) => (state.board.cells[y][x].shown || (state.board.cells[y][x].mined && state.board.cells[y][x].flagged))
      )
    );
  }

  setFlag(y: number, x: number): void {
    const state = this.state.getValue();
    if (this.isFirstCellShown(y, x)) {
      this.state.next({
        ...state,
        state: GameState.inProggress
      });
      this.getTime();
    }
    if (state.board.cells[y][x].shown) {
      return;
    }
    this.state.next({
      ...state,
      board: {
        ...state.board,
        cells: state.board.cells.map(
          (row, dy) => row.map(
            (cell, dx) => (dy === y && dx === x ? {...cell, flagged: !(cell.flagged || cell.shown)} : cell)
          )
        )},
      minesRemain: state.minesRemain + (state.board.cells[y][x].flagged ? 1 : -1)
    });
    this.winner();
  }

  resetGame(boardWidth: number, boardHeight: number, mines: number): void {
    this.createBoard(boardWidth, boardHeight, mines);
    const state = this.state.getValue();
    if (state.state === GameState.inProggress) {
      this.timeSubscription.unsubscribe();
    }
    this.state.next({
      ...state,
      state: GameState.waiting,
      minesRemain: mines,
      time: 0,
    });
  }

  getTime(): void {
    const timeCounter = Observable.interval(1000);
    this.timeSubscription = timeCounter.subscribe(
      (seconds: number) => {
        const state = this.state.getValue();
        this.state.next({
          ...state,
          time: seconds + 1
        });
      });
  }

  play(y: number, x: number): void {
    const state = this.state.getValue();
    if (this.isFirstCellShown(y, x)) {
      this.state.next({
        ...state,
        state: GameState.inProggress
      });
      this.getTime();
    }
    this.uncoverCell(y, x);
    this.winner();
  }

  isFirstCellShown(y: number, x: number): boolean {
    const state = this.state.getValue();
    if (state.state === GameState.inProggress) {
      return false;
    }
    return !state.board.cells.some(
      (row, y) => row.some(
        (cell, x) => (state.board.cells[y][x].shown || state.board.cells[y][x].flagged)
      )
    );
  }
}
