import { Component } from '@angular/core';
import { GameStateServiceService } from '../shared/services/game-state-service.service';

@Component({
  selector: 'app-stopped-box',
  standalone: true,
  imports: [],
  templateUrl: './stopped-box.component.html',
  styleUrl: './stopped-box.component.css'
})
export class StoppedBoxComponent {

  gameEnded = this.gameService.gameEnded
  gameIsPaused = this.gameService.gameisPaused

  constructor(private gameService: GameStateServiceService ) {}


  restartGame(){
    this.gameService.resetGame()
  }
}
