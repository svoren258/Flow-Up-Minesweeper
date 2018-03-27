import { Component, Input } from '@angular/core';
import { Cell } from './cell.model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ms-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent {
  @Input() cell: Cell;

  constructor(private sanitizer: DomSanitizer) {}

  saveImageUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(this.imageUrl());
  }
  imageUrl(): string {
    if (this.cell.flagged) {
      return 'assets/flag.svg';
    }

    if (this.cell.shown && this.cell.mined) {
      return 'assets/mine.jpg';
    }

    if (this.cell.shown && !this.cell.mined) {
      return `assets/Minesweeper_${this.cell.value}.svg`;
    }

    if (this.cell.flagged && !this.cell.mined && this.cell.shown) {
      return 'assets/wrong_mined.png';
    } else {
      return 'assets/square.svg';
    }
    // {
    //   'flag' : cell.flagged ,
    //   'mine' : cell.shown && cell.mined,
    //   'zero' : cell.value === 0 && cell.shown && !cell.mined,
    //   'one' : cell.value === 1 && cell.shown && !cell.mined,
    //   'two' : cell.value === 2 && cell.shown && !cell.mined,
    //   'three' : cell.value === 3 && cell.shown && !cell.mined,
    //   'four' : cell.value === 4 && cell.shown && !cell.mined,
    //   'five' : cell.value === 5 && cell.shown && !cell.mined,
    //   'six' : cell.value === 6 && cell.shown && !cell.mined,
    //   'seven' : cell.value === 7 && cell.shown && !cell.mined,
    //   'eight' : cell.value === 8 && cell.shown && !cell.mined,
    //   'shown' : !cell.shown && !cell.flagged,
    //   'wrong' : cell.flagged && !cell.mined && cell.shown
    // }
  }


}

