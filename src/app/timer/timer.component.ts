import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { BoardService } from '../board.service';


@Component({
  selector: 'ms-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  time$: Observable<number>;

  constructor(private boardService: BoardService) {
    this.time$ = this.boardService.time$;
  }
}
