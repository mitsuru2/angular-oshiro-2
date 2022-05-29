import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [MainComponent, NewCharacterComponent, ListCharacterComponent, TopMenuComponent],
  imports: [CommonModule, MainRoutingModule, ToolbarModule, ButtonModule, ConfirmDialogModule],
  bootstrap: [MainComponent],
  providers: [ConfirmationService],
})
export class MainModule {}
