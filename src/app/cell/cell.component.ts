import { Component, Input } from '@angular/core';
import { CellModel } from './cell.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ms-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent {
  @Input() cell: CellModel;

  constructor(private sanitizer: DomSanitizer) {}

  safeImageUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(this.imageUrl());
  }
  imageUrl(): string {
    if (this.cell.shown && this.cell.mined && !this.cell.flagged) {
      return 'assets/mine.jpg';
    }
    if (this.cell.flagged && !this.cell.mined && this.cell.shown) {
      return 'assets/wrong_mined.png';
    }
    if (this.cell.flagged) {
      return 'assets/flag.svg';
    }
    if (this.cell.shown && !this.cell.mined) {
      return `assets/Minesweeper_${this.cell.value}.svg`;
    } else {
      return 'assets/square.svg';
    }
  }
}

