import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakePlaygroundComponent } from './snake-playground.component';

describe('SnakePlaygroundComponent', () => {
  let component: SnakePlaygroundComponent;
  let fixture: ComponentFixture<SnakePlaygroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnakePlaygroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnakePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
