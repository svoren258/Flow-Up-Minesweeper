import { CellModel } from '../cell/cell.model';

export interface BoardModel {
  height: number;
  width: number;
  cells: CellModel[][];
}
