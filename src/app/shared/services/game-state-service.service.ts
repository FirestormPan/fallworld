import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateServiceService {
  private highScore: number = 0;
  private scoreSubject = new BehaviorSubject<number>(0);
  score$: Observable<number> = this.scoreSubject.asObservable();

  
  private gameEndedSubject = new BehaviorSubject<boolean>(false);
  gameEnded$: Observable<boolean> = this. gameEndedSubject.asObservable();
  
  private restartSubject = new Subject<void>();
  resetTrigger$: Observable<void> = this.restartSubject.asObservable();
  
  private gameisPausedSubject = new BehaviorSubject<boolean>(false);
  gameisPaused$: Observable<boolean> = this.gameisPausedSubject.asObservable();
  
  constructor() {
    this.resetTrigger$.subscribe(
      ()=> this.resetScore()
    );
  }

  getScore(): number{
    return this.scoreSubject.value;
  }

  getGameEnded(): boolean {
    return this.gameEndedSubject.value;
  }

  scoreIncremenet():void{
    this.scoreSubject.next(this.scoreSubject.value + 1);
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
    }
  }


  pauseOrResume():void{
    if(this.gameisPausedSubject.value){
      this.gameisPausedSubject.next(false);
    }else{
      this.gameisPausedSubject.next(true);
    }
  }

  endGame():void{
    this.setHighScore()
    this.gameEndedSubject.next(true);
  }

  resetGame():void{
    this.resetScore();
    this.gameisPausedSubject.next(false);
    this.gameEndedSubject.next(false);
    this.restartSubject.next();
  }

}
