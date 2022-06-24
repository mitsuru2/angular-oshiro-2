import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeThumbnailImageComponent } from './make-thumbnail-image.component';

describe('MakeThumbnailImageComponent', () => {
  let component: MakeThumbnailImageComponent;
  let fixture: ComponentFixture<MakeThumbnailImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeThumbnailImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeThumbnailImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
