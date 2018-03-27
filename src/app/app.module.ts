import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import {BoardService} from './board.service';
import { CellComponent } from './cell/cell.component';
import { TimerComponent } from './timer/timer.component';
import { TimePipe } from './time.pipe';


@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    TimerComponent,
    TimePipe,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [BoardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
