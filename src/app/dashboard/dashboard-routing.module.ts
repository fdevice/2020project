import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HqComponent } from './components/hq/hq.component';


const routes: Routes = [
  {
    path: '',
    component: HqComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}