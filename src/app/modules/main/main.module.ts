import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';
import { ChipsModule } from 'primeng/chips';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { TopMenuComponent } from './views/top-menu/top-menu.component';
import { ConfirmationService } from 'primeng/api';
import { SideMenuComponent } from './views/side-menu/side-menu.component';
import { LegalComponent } from './components/legal/legal.component';
import { NewCharacterFormComponent } from './views/new-character-form/new-character-form.component';
import { NewWeaponFormComponent } from './views/new-weapon-form/new-weapon-form.component';
import { NewFacilityFormComponent } from './views/new-facility-form/new-facility-form.component';
import { NewCharacterConfirmationComponent } from './views/new-character-confirmation/new-character-confirmation.component';
import { MakeThumbnailImageComponent } from './views/make-thumbnail-image/make-thumbnail-image.component';

@NgModule({
  declarations: [
    MainComponent,
    NewCharacterComponent,
    ListCharacterComponent,
    TopMenuComponent,
    SideMenuComponent,
    LegalComponent,
    NewCharacterFormComponent,
    NewWeaponFormComponent,
    NewFacilityFormComponent,
    NewCharacterConfirmationComponent,
    MakeThumbnailImageComponent,
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
    InputTextModule,
    FileUploadModule,
    DialogModule,
    CardModule,
    RadioButtonModule,
    CheckboxModule,
    InputNumberModule,
    AutoCompleteModule,
    DividerModule,
    ChipsModule,
    ProgressSpinnerModule
  ],
  bootstrap: [MainComponent],
  providers: [ConfirmationService],
})
export class MainModule {}
