import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateServiceService {
  private highScore: number = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')!) : 0;

  score = signal(0)

  private livesSubject = new BehaviorSubject<number>(3);
  lives$: Observable<number> = this.livesSubject.asObservable();
  
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
    this.livesSubject.next( this.livesSubject.value + value)
   
    if(this.livesSubject.value ===0){
      this.endGame()
    }
  }

  endGame():void{
    this.setHighScore()
    this.gameEndedSubject.next(true);
  }

  resetGame():void{
    this.resetScore();
    this.livesSubject.next(3)

    this.gameEndedSubject.next(false);
  }

}
