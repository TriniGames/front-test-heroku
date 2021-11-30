import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProductComponent } from './product/product.component';
import { CreateEditProductComponent } from './create-edit-product/create-edit-product.component';
import { CreateEditSupplyComponent } from './create-edit-supply/create-edit-supply.component';
import { SupplyComponent } from './supply/supply.component';

const routes: Routes = [
  {
    path: 'products',
    component: ProductComponent,
  },
  {
    path: 'supplies',
    component: SupplyComponent,
  },
  {
    path: 'createEditProduct',
    component: CreateEditProductComponent,
  },
  {
    path: 'createEditSupply',
    component: CreateEditSupplyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliesRoutingModule {}
