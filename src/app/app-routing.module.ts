import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainLayoutComponent } from './modules/layouts/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: 'main',
    component: MainLayoutComponent,
    children: [
      {
        path: 'supplies',
        loadChildren: () =>
          import('./modules/supplies/supplies.module').then(
            (mod) => mod.SuppliesModule
          ),
      },
      {
        path: 'production',
        loadChildren: () =>
          import('./modules/producction/producction.module').then(
            (mod) => mod.ProducctionModule
          ),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/authenticate/authenticate.module').then(
        (mod) => mod.AuthenticateModule
      ),
  },
  { path: '**', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
