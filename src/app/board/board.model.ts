import { Cell } from '../cell/cell.model';

export interface Board {
  height: number;
  width: number;
  cells: Cell[][];
}
