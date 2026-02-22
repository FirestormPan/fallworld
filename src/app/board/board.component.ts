import { Component, effect, untracked, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameStateService } from '../shared/services/game-state-service.service';

/** Represents a single falling item instance on the board with its position, dimensions, and behavior */
type FallingItem ={
  x: number;
  y: number;
  width: number;
  height: number;
  fallSpeed: number;
  type: string;
  shouldBeDestroyed: boolean;
  onCollision: ()=>void;
}

/** Defines the properties and behavior template for each item type in the game */
type ItemDetails = {
  fallSpeed: number,
  width:number,
  height: number,
  spawnFrequency: number,  // Higher = more frequent spawning (used for weighted randomness)
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
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  constructor(private gameService: GameStateService) {

    //effects need to exist in an injection context (https://angular.dev/guide/di/dependency-injection-context)
    // constructor provides it
    effect(
      ()=>{
        const paused = this.gameService.gameisPaused()
        if( paused )
          this.pressedKeys.clear()
      }
    )

    effect(
      ()=>{
        this.gameService.difficultyLevel()
           
          if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
            this.spawnIntervalId = undefined;
          }
          this.startSpawner();
      }
    )
    
    //whenever the state of gameEnded changes, remove the intervals for spawning items and moving
    effect(
      ()=>{
        const ended = this.gameService.gameEnded()

        if(ended){
          clearInterval(this.gameIntervalId);
          clearInterval(this.spawnIntervalId);

          this.gameIntervalId = undefined;
          this.spawnIntervalId = undefined; 
        }else{
          // Call reset without tracking its signal reads so this effect doesn't
          // become dependent on computed signals like spawnRate.
          untracked(() => this.resetBoard());
        }
      }
    )
  }

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
      spawnFrequency: 110,
      onCollision: ()=>this.gameService.scoreIncremenet(1),
    },
    "death":{
      width: 30,
      height: 30,
      fallSpeed: 2,
      spawnFrequency: 15,
      onCollision: ()=>this.gameService.gainLife( - this.gameService.lives()), //removes all lives
    },
    "golden":{
      width: 30,
      height: 30,
      fallSpeed: 4,
      spawnFrequency: 10,
      onCollision: ()=>{this.gameService.scoreIncremenet(5)},
    },
    "lose-life":{
      width: 30,
      height: 30,
      fallSpeed: 1,
      spawnFrequency: 50,
      onCollision: ()=>this.gameService.gainLife(-1),
    },
    "gain-life":{
      width: 30,
      height: 30,
      fallSpeed: 2,
      spawnFrequency: 1,
      onCollision: ()=>this.gameService.gainLife(+1)
    },
    "remove-lose-life":{ //removes all lose-life icons
      width: 30,
      height: 30,
      fallSpeed: 2,
      spawnFrequency: 5,
      onCollision: ()=>{
        this.fallingItems.forEach(
          item=>{ if(item.type === "lose-life") item.shouldBeDestroyed = true }
        )
      }
    },
    "freeze":{
      width: 35,
      height: 35,
      fallSpeed: 1,
      spawnFrequency: 5,
      onCollision: ()=>{
        //Sets Falling speed (factor) to 0, then gradually raises it back to where it was (over the course of x seconds)
        //Also, sets the Spawn Rate (factor) to a Large number, effectively stopping the spawner, for the same duration
        const LARGE_NUMBER = 50000;

        this.gameService.fallingSpeedFactor.set(0)
        const currentSpawnRate = this.gameService.spawnRateFactor()
        this.gameService.spawnRateFactor.set(LARGE_NUMBER)

        const interval = setInterval(() => {
          this.gameService.fallingSpeedFactor.update(value => value + 0.250)
          if (this.gameService.fallingSpeedFactor() >= 1) {
            this.gameService.spawnRateFactor.set(currentSpawnRate)
            clearInterval(interval)
          }
        }, 750)
      }
    }
  };

  // Pre-calculated frequency table for weighted random item selection
  // Built in ngOnInit by extracting spawnFrequency from each item type
  FREQUENCY_TABLE:number[]=[];
  FREQUENCY_SUM: number=0;

  fallingItems: FallingItem[] = [];

  pressedKeys: Set<string> = new Set(); // Track pressed keys to declare direction in movement

  //====== Keyboard Input Handling ======
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(this.gameService.gameisPaused()) return;
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.pressedKeys.add(event.key);
    }
  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

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
      step: board.offsetWidth * 0.008
    };
  }

  //function to attach and detach resize event listener
  private resizeHandler = () => this.updateBoardSizes();
 
  get playerRectangle() {
    return {
      x: this.geometry.playerX,
      y: this.geometry.boardHeight - this.geometry.playerHeight -1, //-1 to avoid barely catching them as they exit
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
    // Build frequency table for weighted random selection in pickRandomItemType()
    const items = Object.values(this.ITEM_DEFINITIONS); 
    this.FREQUENCY_TABLE = items.map((item) => item.spawnFrequency);
    this.FREQUENCY_SUM = items.reduce((sum, item: ItemDetails) => sum + item.spawnFrequency, 0);
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


  /**
   * Starts an interval that updates the logic due to which the DOM is rendered/updated
   */
  startGameLoop() {
    if (this.gameIntervalId) return;

    this.gameIntervalId = window.setInterval(() => {
      if(this.gameService.gameisPaused()) return;
      this.updatePlayerPosition();
      this.destroyItems();
      this.updateItemPositions();
      this.checkColisions();

    }, 17); // roughly 60fps
  }

  /**
   * Updates only the logical numbers, not the DOM
   */
  updatePlayerPosition() {
    if (this.pressedKeys.has('ArrowLeft')) {
      this.geometry.playerX = Math.max(0, this.geometry.playerX - this.geometry.step);
    }
    if (this.pressedKeys.has('ArrowRight')) {
      this.geometry.playerX = Math.min(this.geometry.boardWidth - this.geometry.playerWidth, this.geometry.playerX + this.geometry.step);
    }
  }

  /**
   * remove any items that have left the board, or are marked as shouldBeDestroyed by other parts of the code
   */
  destroyItems(){ 
    this.fallingItems = this.fallingItems.filter((item) =>{
      return (item.y < this.geometry.boardHeight) && !item.shouldBeDestroyed;
    })
  }

  updateItemPositions() {
    const multiplier = this.gameService.fallingSpeedMultiplier();
    for (let item of this.fallingItems) {
      item.y += item.fallSpeed * multiplier;
    }
  }

  startSpawner(){
    if (this.spawnIntervalId) return;

    this.spawnIntervalId = window.setInterval(() => {
      if(this.gameService.gameisPaused()) return;
      this.spawnItem();
    }, this.gameService.spawnRate());
  }

  /**
   * Creates a fallingItem and pushes it to the fallingItems array, which is used to render the items in the DOM and update their positions. The type of the item is dictated by the pickRandomItemType function, which uses weighted randomness based on the spawnFrequency property of each item type in the ITEM_DEFINITIONS. Each item also has an onCollision function, which is called when the item collides with the player, and dictates what happens to the game state when that specific item is caught.
   */
  spawnItem() {
    const randomType = this.pickRandomItemType();

    let itemDetails = this.ITEM_DEFINITIONS[randomType];

    const xPosition = Math.random() * (this.geometry.boardWidth - itemDetails.width);
    const newItem: FallingItem = {
      x: xPosition,
      y: 0,
      fallSpeed: itemDetails.fallSpeed,
      width: itemDetails.width,
      height: itemDetails.height,
      type: randomType,
      shouldBeDestroyed: false,
      onCollision: itemDetails.onCollision
    };
    this.fallingItems.push(newItem);
  }

  /**
   * Selects a random item type using weighted randomness based on spawnFrequency.
   * Higher spawnFrequency = greater probability of selection.
   * Algorithm: generates random number 0-FREQUENCY_SUM, then iterates through cumulative frequencies
   * to find which item type's range contains that number.
   * @returns the item type (string)
   */
  pickRandomItemType(){
    const ITEM_TYPES = Object.keys(this.ITEM_DEFINITIONS);

    // Generate random indicator in range [0, FREQUENCY_SUM]
    let indicator = Math.random() * this.FREQUENCY_SUM;
    
    // Find which item type range contains the indicator using cumulative frequency
    let pointer = 0;
    for(let [index, frequency] of this.FREQUENCY_TABLE.entries()){
      pointer += frequency;
      if(indicator <= pointer) {        
        return ITEM_TYPES[index];
      }
    }

    // Fallback (should not reach here due to floating-point precision)
    return "good";
  }

  checkColisions(){
    this.fallingItems =this.fallingItems.filter( item=>{
      if(!this.isCollidingWithPlayer(item)){
        return true
      }else{
        item.onCollision();
        
        return false
      }
    });
  }

  resetBoard(){
    //reset all values
    this.fallingItems =[];
    this.geometry.playerX = 100;
    this.pressedKeys.clear();

    clearInterval(this.gameIntervalId )
    clearInterval(this.spawnIntervalId)
    
    // Clear interval IDs so new ones can be created
    this.gameIntervalId = undefined;
    this.spawnIntervalId = undefined;
    
    //restart the loops
    this.startGameLoop();
    this.startSpawner();
  }
}