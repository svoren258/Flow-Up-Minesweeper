import { Component } from '@angular/core';
import { BoardService, DEFAULT_HEIGHT, DEFAULT_MINES, DEFAULT_WIDTH } from './board.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { GameState } from './board/game-state.model';

@Component({
  selector: 'ms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  boardSettings: FormGroup = new FormGroup({
    width: new FormControl(DEFAULT_WIDTH, Validators.min(6)),
    height: new FormControl(DEFAULT_HEIGHT, Validators.min(6)),
    mines: new FormControl(DEFAULT_MINES, Validators.min(6))
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

