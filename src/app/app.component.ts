import { Component, OnInit, OnDestroy, Signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateServiceService } from './shared/services/game-state-service.service';
import { StoppedBoxComponent } from "./stopped-box/stopped-box.component";
import { BoardComponent } from './board/board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StoppedBoxComponent, BoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
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


  ngOnInit(){

  }


  pauseOrResume(){
    this.gameService.pauseOrResume();
  }

  playAgain(){
    this.gameService.resetGame();
  }
}


