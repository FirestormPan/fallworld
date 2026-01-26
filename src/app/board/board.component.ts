import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameStateServiceService } from '../shared/services/game-state-service.service';
import { AsyncPipe } from '@angular/common';


type FallingItem ={
  x: number;
  y: number;
  width: number;
  height: number;
  fallSpeed: number;
  type: string;
  onCollision: ()=>void;
}

type ItemDetails = {
  fallSpeed: number,
  width:number,
  height: number,
  
  onCollision: ()=>void 
}

interface BoardGeometry{
  boardWidth: number;
  boardHeight: number;
  playerWidth: number;
  playerHeight: number;
  playerX: number;
  step: number;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  constructor(private gameService: GameStateServiceService) {}

  private gameIntervalId?: number;
  private spawnIntervalId?: number;

  // monitor the size the board and player get dynamically (due to css) so that it can be used in movement calculations
  @ViewChild('board') boardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('player') playerRef!: ElementRef<HTMLDivElement>;

  // Dimensions will be updated after view init
  geometry: BoardGeometry = {
    boardWidth: 0,
    boardHeight: 0,
    playerWidth: 0,
    playerHeight: 0,
    playerX: 0,
    step: 0
  };

  ITEM_DEFINITIONS: Record<string, ItemDetails> = {
    "good":{
      width: 30,
      height: 30,
      fallSpeed: 2,
      onCollision: ()=>this.gameService.scoreIncremenet(),
    },
    "death":{
      width: 30,
      height: 30,
      fallSpeed: 2,
      onCollision: ()=>this.endGame(),
    },
    "golden":{
      width: 30,
      height: 30,
      fallSpeed: 4,
      onCollision: ()=>{for(let i=0; i<3; i++)this.gameService.scoreIncremenet()},
    }
  }

  spawnRate = 3000; //will later be changed to variable difficulty

  fallingItems: FallingItem[] = [];

  pressedKeys: Set<string> = new Set(); // Track pressed keys to declare direction in movement

  gameEnded$ = this.gameService.gameEnded$;

  boardisPaused: boolean = false;

  // ========Create the board based on the sizes of the screeen=======
  updateBoardSizes() {
    const board = this.boardRef.nativeElement;
    const player = this.playerRef.nativeElement;

    this.geometry = {
      boardWidth: board.offsetWidth,
      boardHeight: board.offsetHeight,
      playerWidth: player.offsetWidth,
      playerHeight: player.offsetHeight,
      playerX: 100,
      step: board.offsetWidth * 0.01
    };
  }

  //====== Keyboard Input Handling ======
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(this.boardisPaused) return;
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    this.pressedKeys.add(event.key);
  }

  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  //prevent the spawner from creating objects while the loop cannot move them (browser thing)
  //TODO: might be buggy and somehow restart the game
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.hidden) {
      this.pauseBoard();
    } else {
      this.resumeBoard();
    }
  }

  //function to attach and detach resize event listener
  private resizeHandler = () => this.updateBoardSizes();
 
  get playerRectangle() {
    return {
      x: this.geometry.playerX,
      y: this.geometry.boardHeight - this.geometry.playerHeight,
      width: this.geometry.playerWidth,
      height: this.geometry.playerHeight
    };
  }

  isCollidingWithPlayer(item: FallingItem): boolean {
    const player = this.playerRectangle;

    return (
      item.x < player.x + player.width &&
      item.x + item.width > player.x &&
      item.y < player.y + player.height &&
      item.y + item.height > player.y
    );
  }

  ngOnInit() {
    this.gameService.resetTrigger$.subscribe(
      ()=> this.resetBoard()
    )

    this.gameService.gameisPaused$.subscribe((isPaused)=>{
      if(isPaused){
        this.pauseBoard();
      }else{
        this.resumeBoard();
      }
    })
  }


  ngAfterViewInit() {
    this.updateBoardSizes();
    window.addEventListener('resize', this.resizeHandler);
    this.startGameLoop();
    this.startSpawner();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    clearInterval(this.gameIntervalId);
    clearInterval(this.spawnIntervalId);
  }


  startGameLoop() {
    if (this.gameIntervalId) return;

    this.gameIntervalId = window.setInterval(() => {
      if(this.boardisPaused) return;
      this.updatePlayerPosition();
      this.updateItems();

      this.checkColisions();

    }, 20); // roughly 50fps
  }


  pauseBoard() {
    if (this.gameService.getGameEnded()) return;

    this.boardisPaused = true;
  }

  resumeBoard(){
    // Do not resume if the game has ended
    if (this.gameService.getGameEnded()) return;
    this.boardisPaused = false;
  }

  updatePlayerPosition() {
    if (this.pressedKeys.has('ArrowLeft')) {
      this.geometry.playerX = Math.max(0, this.geometry.playerX - this.geometry.step);
    }
    if (this.pressedKeys.has('ArrowRight')) {
      this.geometry.playerX = Math.min(this.geometry.boardWidth - this.geometry.playerWidth, this.geometry.playerX + this.geometry.step);
    }
  }

  updateItems() {
    for (let item of this.fallingItems) {
      item.y += item.fallSpeed;
    }
    this.fallingItems = this.fallingItems.filter(item => item.y < this.geometry.boardHeight);
  }

  startSpawner(){
    if (this.spawnIntervalId) return;

    this.spawnIntervalId = window.setInterval(() => {
      if(this.boardisPaused) return;
      this.spawnItem();
    }, this.spawnRate);
  }

  spawnItem() {
    const ITEM_TYPES = Object.keys(this.ITEM_DEFINITIONS);

    const randomType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)]

    let itemDetails = this.ITEM_DEFINITIONS[randomType];

    const xPosition = Math.random() * (this.geometry.boardWidth - itemDetails.width);
    const newItem: FallingItem = {
      x: xPosition,
      y: 0,
      fallSpeed: itemDetails.fallSpeed,
      width: itemDetails.width,
      height: itemDetails.height,
      type: randomType,
      onCollision: itemDetails.onCollision
    };
    this.fallingItems.push(newItem);
  }


  checkColisions(){
    this.fallingItems =this.fallingItems.filter( item=>{
      if(!this.isCollidingWithPlayer(item)){
        return true
      }else{
        item.onCollision();
    
        if(this.gameService.getScore() % 3 === 0){
          this.increaseDifficulty()
        }
        
        return false
      }
    });
  }

  increaseDifficulty() {
    if (this.spawnIntervalId) {
      clearInterval(this.spawnIntervalId);
      this.spawnIntervalId = undefined;
    }

    this.spawnRate *= 0.9;
    this.startSpawner();
  }


  endGame() {
    clearInterval(this.gameIntervalId);
    clearInterval(this.spawnIntervalId);
    
    this.gameService.endGame();
  }

  resetBoard(){
    //reset all values
    this.fallingItems =[];
    this.geometry.playerX = 100;
    this.spawnRate = 3000;
    this.pressedKeys.clear();
    
    // Clear interval IDs so new ones can be created
    this.gameIntervalId = undefined;
    this.spawnIntervalId = undefined;
    
    //restart the loops
    this.startGameLoop();
    this.startSpawner();
  }
}