import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { ConfirmationService } from 'primeng/api';
import { SideMenuComponent } from './views/side-menu/side-menu.component';

@NgModule({
  declarations: [MainComponent, NewCharacterComponent, ListCharacterComponent, TopMenuComponent, SideMenuComponent],
  imports: [CommonModule, MainRoutingModule, ToolbarModule, ButtonModule, ConfirmDialogModule, MenuModule],
  bootstrap: [MainComponent],
  providers: [ConfirmationService],
})
export class MainModule {}
