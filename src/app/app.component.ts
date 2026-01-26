import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateServiceService } from './shared/services/game-state-service.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private gameService: GameStateServiceService) {}
  
  highScore: number = 0; //TODO: save and load from local storage
  title = 'fallworld';
  score: number = 0;

  gameEnded: boolean = false;

  paused$ = this.gameService.gameisPaused$;
  

  ngOnInit(){
    this.gameService.score$.subscribe((currentScore)=>{
      this.score = currentScore;
    })

    this.gameService.gameEnded$.subscribe((ended)=>{
      this.gameEnded = ended;
      this.highScore = this.gameService.getHighScore();
    });
  }


  pauseOrResume(){
    this.gameService.pauseOrResume();
  }

  playAgain(){
    this.gameService.resetGame();
  }

}


