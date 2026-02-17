import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateServiceService {
  private highScore: number = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')!) : 0;

  score = signal(0)

  private _lives = signal(3); 
  readonly lives = this._lives.asReadonly();

  difficultyLevel = signal(0);
  readonly spawnRate = computed(
    ()=>
     Math.max( Math.pow( 1.2, ( -this.difficultyLevel() / 2 ) )  * 3000  , 250) // f(x) = a^(-x/b) for a smooth decline. after spawnrate reaches 250, we stop decreasing it 
  );
  readonly fallingSpeedMultiplier = computed(
    ()=> this.difficultyLevel() * 0.05 + 1
  )


  gameEnded = signal(false)
  public  gameisPaused = signal(false)
  
  constructor() {}

  getScore(): number{
    return this.score()
  }

  scoreIncremenet(value: number):void{
    this.score.update( score => score + value)
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

  increaseDifficulty(): void{
    this.difficultyLevel.update( value => value +1)
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
    this.score.set(0)
    this._lives.set(3)

    this.difficultyLevel.set(0)

    this.gameEnded.set(false);
  }

}
