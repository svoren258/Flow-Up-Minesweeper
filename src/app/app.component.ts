import { Component } from '@angular/core';
import { BoardService } from './board.service';

@Component({
  selector: 'ms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public boardService: BoardService) {}

}

