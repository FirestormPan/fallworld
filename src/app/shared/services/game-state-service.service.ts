import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateServiceService {
  private highScore: number = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')!) : 0;

  score = signal(0)

  private _lives = signal(3); 
  readonly lives = this._lives;
  
  private gameEndedSubject = new BehaviorSubject<boolean>(false);
  gameEnded$: Observable<boolean> = this.gameEndedSubject.asObservable();

  public  gameisPaused = signal(false)
  
  constructor() {
    this.gameEnded$.subscribe(
      (gameEnded)=>{
        if(!gameEnded){
          this.resetScore()
        }
      }
    );
  }

  getScore(): number{
    return this.score()
  }

  getGameEnded(): boolean {
    return this.gameEndedSubject.value;
  }

  scoreIncremenet(value: number):void{
    this.score.update( score => score + value)
  }

  resetScore():void{
    this.score.set(0)
  }

  getHighScore(): number {
    return this.highScore;
  }

  setHighScore(): void {
    if (this.getScore() > this.highScore) {
      this.highScore = this.getScore();
      localStorage.setItem('highScore', this.highScore.toString());
    }
  }


  pauseOrResume():void{
    if(this.gameisPaused()){
      this.gameisPaused.set(false);
    }else{
      this.gameisPaused.set(true);
    }
  }

  gainLife(value: number):void{
    this._lives.update( lives => lives + value)
   
    if(this._lives() === 0){
      this.endGame()
    }
  }

  endGame():void{
    this.setHighScore()
    this.gameEndedSubject.next(true);
  }

  resetGame():void{
    this.resetScore();
    this._lives.set(3)

    this.gameEndedSubject.next(false);
  }

}
