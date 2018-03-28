import { Component } from '@angular/core';
import { BoardService, DEFAULT_HEIGHT, DEFAULT_MINES, DEFAULT_WIDTH } from './board.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { GameState } from './board/game-state.model';
import { AbstractControlOptions } from '@angular/forms/src/model';
import { integerRangeValidator } from './integer-range.validator';

@Component({
  selector: 'ms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  boardSettings: FormGroup = new FormGroup({
    width: new FormControl(DEFAULT_WIDTH, integerRangeValidator(6, 50)),
    height: new FormControl(DEFAULT_HEIGHT, integerRangeValidator(6, 50)),
    mines: new FormControl(DEFAULT_MINES, integerRangeValidator(0, 100))
  });

  minesRemain$: Observable<number>;
  gameState$: Observable<GameState>;
  constructor(private boardService: BoardService) {
    this.minesRemain$ = this.boardService.minesRemain$;
    this.gameState$ = this.boardService.gameState$;
  }

  onSubmit(): void {
    const {width, height, mines} = this.boardSettings.value;
    this.boardService.resetGame(Number(width), Number(height), Number(mines));
  }
}
