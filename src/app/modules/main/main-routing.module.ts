import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { MainComponent } from './main.component';

const routes: Routes = [
  { path: '', component: MainComponent, children: [{ path: 'new-character', component: NewCharacterComponent }] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
