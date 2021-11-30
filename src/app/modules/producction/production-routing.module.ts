import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainProductionComponent } from './main-production/main-production.component';

const routes: Routes = [
  {
    path: 'prod',
    component: MainProductionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductionRoutingModule {}
