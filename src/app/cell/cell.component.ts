import { Component, Input } from '@angular/core';
import { Cell } from './cell.model';

@Component({
  selector: 'ms-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent {
  @Input() cell: Cell;
}

