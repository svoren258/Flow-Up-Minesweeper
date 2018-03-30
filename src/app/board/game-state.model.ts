import { BoardModel } from './board.model';

export enum GameState {
  InProggress,
  Lost,
  Won,
  Waiting,
}

export interface GameStateModel {
  board: BoardModel;
  state: GameState;
  time: number;
  minesRemain: number;
}
