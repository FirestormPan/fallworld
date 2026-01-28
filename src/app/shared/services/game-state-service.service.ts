import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateServiceService {
  private highScore: number = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')!) : 0;

  private scoreSubject = new BehaviorSubject<number>(0);
  score$: Observable<number> = this.scoreSubject.asObservable();

  private livesSubject = new BehaviorSubject<number>(3);
  lives$: Observable<number> = this.livesSubject.asObservable();
  
  private gameEndedSubject = new BehaviorSubject<boolean>(false);
  gameEnded$: Observable<boolean> = this.gameEndedSubject.asObservable();
  
  private gameisPausedSubject = new BehaviorSubject<boolean>(false);
  gameisPaused$: Observable<boolean> = this.gameisPausedSubject.asObservable();
  
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
    return this.scoreSubject.value;
  }

  getGameEnded(): boolean {
    return this.gameEndedSubject.value;
  }

  scoreIncremenet(value: number):void{
    this.scoreSubject.next(this.scoreSubject.value + value);
  }

  resetScore():void{
    this.scoreSubject.next(0)
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
    if(this.gameisPausedSubject.value){
      this.gameisPausedSubject.next(false);
    }else{
      this.gameisPausedSubject.next(true);
    }
  }

  gainLife(value: number):void{
    this.livesSubject.next( this.livesSubject.value + value)
   
    if(this.livesSubject.value==0){
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
