import { Board } from './board.model';

export enum GameState {
  inProggress = 0,
  lost = 1,
  won = 2,
  waiting = 3,
}

export interface GameStateModel {
  board: Board;
  state: GameState;
  time: number;
  minesRemain: number;
}
