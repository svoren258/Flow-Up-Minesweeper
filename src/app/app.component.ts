import { Component } from '@angular/core';
import { BoardService, DEFAULT_HEIGHT, DEFAULT_MINES, DEFAULT_WIDTH } from './board.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { GameState } from './board/game-state.model';
import { AbstractControlOptions } from '@angular/forms/src/model';

@Component({
  selector: 'ms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  boardSettings: FormGroup = new FormGroup({
    width: new FormControl(DEFAULT_WIDTH, this.formValidator.bind(this)),
    height: new FormControl(DEFAULT_HEIGHT, this.formValidator.bind(this)),
    mines: new FormControl(DEFAULT_MINES, this.formValidator.bind(this))
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

  formValidator(control: FormControl): {[s: string]: boolean} {
    if (!Number.isInteger(Number(control.value)) || control.value < 6 || control.value > 50) {
      return {invalid : true};
    }
    return null;
  }

}

