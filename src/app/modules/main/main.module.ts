import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';

@NgModule({
  declarations: [MainComponent, NewCharacterComponent],
  imports: [CommonModule, MainRoutingModule],
  bootstrap: [MainComponent],
})
export class MainModule {}
