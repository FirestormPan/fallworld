import { Component, OnInit, Signal, effect, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameStateService } from './shared/services/game-state-service.service';
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

  constructor(private gameService: GameStateService) {
  }
  
  readonly score:Signal<number> = this.gameService.score;
  highScore: Signal<number> = this.gameService.highScore
  gameEnded = this.gameService.gameEnded
  paused = this.gameService.gameisPaused;

  lives = this.gameService.lives

  
  // prevent the spawner from creating objects while the loop cannot move them (browser thing)
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if(this.gameService.gameEnded()) return;
    if (document.hidden) {
      this.gameService.gameisPaused.set(true)
    }
    //  else { //causes logical problems(restarts the board even when the user has declared pause by button) that would require a lot of changes for minimal gain   
    //   this.resumeBoard();
    // }
  }


  ngOnInit(){

  }


  pauseOrResume(){
    this.gameService.pauseOrResume();
  }

  playAgain(){
    this.gameService.resetGame();
  }
}


