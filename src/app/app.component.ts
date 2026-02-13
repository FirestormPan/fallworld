import { Component, OnInit, OnDestroy, Signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateServiceService } from './shared/services/game-state-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fallworld';

  constructor(private gameService: GameStateServiceService) {
    
    effect(
      ()=>{
        const ended = this.gameService.gameEnded()
        this.gameEnded = ended;
        this.highScore = this.gameService.getHighScore();
      }
    )
  }
  
  readonly score:Signal<number> = this.gameService.score;
  highScore: number = this.gameService.getHighScore();
  gameEnded: boolean = false;
  paused = this.gameService.gameisPaused;

  lives = this.gameService.lives
  
  private destroy$ = new Subject<void>();

  ngOnInit(){

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


