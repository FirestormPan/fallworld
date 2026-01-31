import { Component, OnInit, OnDestroy, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateServiceService } from './shared/services/game-state-service.service';
import { AsyncPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fallworld';

  constructor(private gameService: GameStateServiceService) {}
  
  readonly score:Signal<number> = this.gameService.score;
  highScore: number = this.gameService.getHighScore();
  gameEnded: boolean = false;
  paused = this.gameService.gameisPaused;

  lives$ = this.gameService.lives$
  
  private destroy$ = new Subject<void>();

  ngOnInit(){

    this.gameService.gameEnded$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ended) => {
        this.gameEnded = ended;
        this.highScore = this.gameService.getHighScore();
      });
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  pauseOrResume(){
    this.gameService.pauseOrResume();
  }

  playAgain(){
    this.gameService.resetGame();
  }
}


