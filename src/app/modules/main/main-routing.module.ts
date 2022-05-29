import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCharacterComponent } from './components/list-character/list-character.component';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'new-character', component: NewCharacterComponent },
      { path: 'list-character', component: ListCharacterComponent },
      { path: '', redirectTo: 'list-character', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
