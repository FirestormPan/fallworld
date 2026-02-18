import { Component } from '@angular/core';
import { GameStateService } from '../shared/services/game-state-service.service';

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

  constructor(private gameService: GameStateService ) {}


  restartGame(){
    this.gameService.resetGame()
  }
}
