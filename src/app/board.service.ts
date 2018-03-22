import { Injectable, ViewChild } from '@angular/core';
import { Board } from './board/board.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { interval } from 'rxjs/observable/interval';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { NgForm } from '@angular/forms';

export enum GameState {
  inProggress = 0,
  lost = 1,
  won = 2,
  waiting = 3,
}

const NEIGHBORHOOD: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]
];

@Injectable()
export class BoardService {
  defaultHeight = 8;
  defaultWidth = 8;
  mineCount = 10;
  minesRemain = 10;
  timeSubscription: Subscription;
  private board = new BehaviorSubject<Board>(null);
  board$ = this.board.asObservable();
  private time = new BehaviorSubject<number>(null);
  time$ = this.time.asObservable();
  gameState = GameState.waiting;

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
    this.createBoard();
  }

  createBoard(): void {
    let mines: [number, number][];
    mines = this.placeMines();

    const newBoard: Board = {
      height: this.defaultHeight,
      width: this.defaultWidth,
      cells: new Array(this.defaultHeight)
        .fill(0)
        .map((_, y) => new Array(this.defaultWidth)
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
    this.board.next(filledBoard);
  }

  private contains(mineArray: [number, number][], mine: [number, number]): boolean {
    return mineArray.some(m => mine[0] === m[0] && mine[1] === m[1]);
  }

  placeMines(): [number, number][] {
    const mines: [number, number][] = [];
    for (let x = 0; x < this.mineCount; x++) {
      let xy: [number, number];
      do {
        xy = [
          Math.floor(Math.random() * this.defaultHeight),
          Math.floor(Math.random() * this.defaultWidth)
        ];
      } while (this.contains(mines, xy));
      mines.push(xy);
    }
    return mines;
  }

  uncoverMultipleCells(y: number, x: number): void {
    const board = this.board.getValue();
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if ((i === y && j === x)
          || (i < 0)
          || (j < 0)
          || (i > board.height - 1)
          || (j > board.width - 1)) {
          continue;
        }
        if (!board.cells[i][j].shown
          && !board.cells[i][j].mined) {
          this.uncoverCell(i, j);
        }
      }
    }
  }

  uncoverCell(y: number, x: number): void {
    const board = this.board.getValue();
    if (board.cells[y][x].flagged) {
      return;
    }

    this.board.next({
      ...board,
      cells: board.cells.map(
        (row, dy) => row.map(
          (cell, dx) => (dx === x && dy === y ? {...cell, shown: true} : cell)
        )
      )
    });

    if (board.cells[y][x].mined) {
      this.endGame();
      return;
    }
    if (board.cells[y][x].value === 0) {
      this.uncoverMultipleCells(y, x);
    }
  }

  winner(): void {
    if (this.amIWinner()) {
      this.gameState = GameState.won;
      this.timeSubscription.unsubscribe();
    }
  }

  endGame(): void {
    const board = this.board.getValue();
    this.board.next({
      ...board,
      cells: board.cells.map(
        (row) => row.map(
          (cell) => ({...cell, shown: (cell.mined || cell.shown) || (cell.flagged && !cell.mined)})
        )
      )
    });

    this.gameState = GameState.lost;
    this.timeSubscription.unsubscribe();
  }

  amIWinner(): boolean {
    const board = this.board.getValue();
    return this.board.getValue().cells.every(
      (row, y) => row.every(
        (cell, x) => (board.cells[y][x].shown || (board.cells[y][x].mined && board.cells[y][x].flagged))
      )
    );
  }

  setFlag(y: number, x: number): void {
    const board = this.board.getValue();
    if (this.isFirstCellShown(y, x)) {
      this.gameState = GameState.inProggress;
      this.getTime();
    }

    if (board.cells[y][x].shown) {
      return;
    }
    board.cells[y][x].flagged ? this.minesRemain++ : this.minesRemain--;
    this.board.next({
      ...board,
      cells: board.cells.map(
        (row, dy) => row.map(
          (cell, dx) => (dy === y && dx === x ? {...cell, flagged: !(cell.flagged || cell.shown)} : cell)
        )
      )
    });
    this.winner();
  }

  resetGame(): void {
    this.createBoard();
    if (this.gameState === GameState.inProggress) {
      this.timeSubscription.unsubscribe();
    }
    this.gameState = GameState.waiting;
    this.time.next(0);
  }

  getTime(): void {
    const timeCounter = Observable.interval(1000);
    this.timeSubscription = timeCounter.subscribe(
      (seconds: number) => {
        this.time.next(seconds + 1);
      });
  }

  play(y: number, x: number): void {
    if (this.isFirstCellShown(y, x)) {
      this.gameState = GameState.inProggress;
      this.getTime();
    }
    this.uncoverCell(y, x);
  }

  isFirstCellShown(y: number, x: number): boolean {
    if (this.gameState === GameState.inProggress) {
      return false;
    }
    const board = this.board.getValue();
    return !board.cells.some(
      (row, y) => row.some(
        (cell, x) => (board.cells[y][x].shown || board.cells[y][x].flagged)
      )
    );
  }

  onSubmit(form: NgForm): void {
    this.defaultHeight = parseInt(form.value.height, 10);
    this.defaultWidth = parseInt(form.value.width, 10);
    this.mineCount = parseInt(form.value.mines, 10);
    this.minesRemain = parseInt(form.value.mines, 10);
    this.resetGame();
  }
}
