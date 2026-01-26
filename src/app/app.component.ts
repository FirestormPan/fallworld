import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateServiceService } from './shared/services/game-state-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private gameService: GameStateServiceService) {}
  
  highScore: number = 0; //TODO: save and load from local storage
  title = 'fallworld';
  score: number = 0;

  gameEnded: boolean = false;
  

  ngOnInit(){
    this.gameService.score$.subscribe((currentScore)=>{
      this.score = currentScore;
    })

    this.gameService.gameEnded$.subscribe((ended)=>{
      this.gameEnded = ended;
      this.highScore = this.gameService.getHighScore();
    });
  }

  playAgain(){
    this.gameService.resetGame();
  }

}


