import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainProductionComponent } from './main-production/main-production.component';
import { ProductionRoutingModule } from './production-routing.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MainProductionComponent],
  imports: [
    CommonModule,
    ProductionRoutingModule,
    MatExpansionModule,
    MatToolbarModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class ProducctionModule {}
