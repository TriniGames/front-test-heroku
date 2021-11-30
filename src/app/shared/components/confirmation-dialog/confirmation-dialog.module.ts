import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ConfirmationDialogComponent],
  imports: [CommonModule, MatButtonModule],
})
export class ConfirmationDialogModule {}
