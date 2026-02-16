import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoppedBoxComponent } from './stopped-box.component';

describe('StoppedBoxComponent', () => {
  let component: StoppedBoxComponent;
  let fixture: ComponentFixture<StoppedBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoppedBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoppedBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
