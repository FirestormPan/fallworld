import { computed, Injectable, signal } from '@angular/core';

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
    ()=>{
      return Math.floor(this.score() /4)
    }
  )
  readonly spawnRate = computed(
    ()=>
     Math.max( Math.pow( 1.2, ( -this.difficultyLevel() / 2 ) )  * 3000  , 250) // f(x) = a^(-x/b) for a smooth decline. after spawnrate reaches 250, we stop decreasing it 
  );
  readonly fallingSpeedMultiplier = computed(
    ()=> this.difficultyLevel() * 0.05 + 1
  )


  gameEnded = signal(false)
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
    this.gameEnded.set(true);
  }

  resetGame():void{
    this._score.set(0)
    this._lives.set(3)

    this.gameEnded.set(false);
  }

}
