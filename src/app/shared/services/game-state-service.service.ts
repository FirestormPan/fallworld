import { computed, Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  highScore_value: number = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')!) : 0;
  private _highScore = signal(this.highScore_value)
  readonly highScore = this._highScore.asReadonly();
  
  private _score = signal(0)
  readonly score = this._score.asReadonly();

  private _lives = signal(3); 
  readonly lives = this._lives.asReadonly();

  readonly difficultyLevel = computed(
    ()=>  Math.floor(this.score() /4)
  )
  public spawnRateFactor = signal(1); //Used by FallingItems to cause special effects on the spanw rate
  readonly spawnRate = computed(
    ()=>{
      let baseRate = Math.max( Math.pow( 1.2, ( -this.difficultyLevel() / 2 ) )  * 3000  , 250) // f(x) = a^(-x/b), a>1 for a smooth decline. after spawnrate reaches 250, stop decreasing it 
      return baseRate * this.spawnRateFactor()
    }

  );
  public fallingSpeedFactor=signal(1) //Used by FallingItems to cause special effects on the falling Speed
  readonly fallingSpeedMultiplier = computed(
    ()=>{
      let fallspeed = (this.difficultyLevel() * 0.05 + 1) * this.fallingSpeedFactor();
      console.log("fallspeed calculated: " + fallspeed)
      return fallspeed
    }
  )

  private _gameEnded = signal(false)
  readonly gameEnded = this._gameEnded.asReadonly();

  public gameisPaused = signal(false)
  
  constructor() {}

  getScore(): number{
    return this.score()
  }

  scoreIncremenet(value: number):void{
    this._score.update( score => score + value)
  }

  setHighScore(): void {
    if (this.getScore() > this.highScore()) {
      this._highScore.set(this.getScore());
      localStorage.setItem('highScore', this.highScore().toString());
    }
  }

  pauseOrResume():void{
    if(this.gameisPaused() && !this.gameEnded()){
      this.gameisPaused.set(false);
    }else{
      this.gameisPaused.set(true);
    }
  }

  gainLife(value: number):void{
    this._lives.update( _lives => _lives + value)
   
    if(this._lives() <= 0){
      this.endGame()
    }
  }

  endGame():void{
    this.setHighScore()
    this._gameEnded.set(true);
  }

  resetGame():void{
    this._score.set(0)
    this._lives.set(3)

    this._gameEnded.set(false);
  }

}
