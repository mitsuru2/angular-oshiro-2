import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { ConfirmationService } from 'primeng/api';
import { SideMenuComponent } from './views/side-menu/side-menu.component';
import { LegalComponent } from './components/legal/legal.component';

@NgModule({
  declarations: [
    MainComponent,
    NewCharacterComponent,
    ListCharacterComponent,
    TopMenuComponent,
    SideMenuComponent,
    LegalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    ToolbarModule,
    ButtonModule,
    ConfirmDialogModule,
    MenuModule,
    PanelModule,
    DropdownModule,
  ],
  bootstrap: [MainComponent],
  providers: [ConfirmationService],
})
export class MainModule {}
