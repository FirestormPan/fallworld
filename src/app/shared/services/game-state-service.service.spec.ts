import { TestBed } from '@angular/core/testing';

import { GameStateServiceService } from './game-state-service.service';

describe('GameStateServiceService', () => {
  let service: GameStateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
