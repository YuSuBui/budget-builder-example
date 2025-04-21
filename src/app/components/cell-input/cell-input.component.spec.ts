import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellInputComponent } from './cell-input.component';

describe('CellInputComponent', () => {
  let component: CellInputComponent;
  let fixture: ComponentFixture<CellInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
