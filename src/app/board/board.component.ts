import { Component, Input, OnInit } from '@angular/core';
import { BoardService } from '../board.service';
import { Board } from './board.model';
import { Observable } from 'rxjs/Observable';
import { GameStateModel } from './game-state.model';

@Component({
  selector: 'ms-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  board$: Observable<Board>;

  constructor(private boardService: BoardService) {
    this.board$ = this.boardService.board$;
  }

  onClick(y: number, x: number): void {
    this.boardService.play(y, x);
  }

  onRightClick(y: number, x: number, event: Event): void {
    event.preventDefault();
    this.boardService.setFlag(y, x);
  }
}
