import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticateRoutingModule } from './authenticate-routing.module';
import { NgxsModule } from '@ngxs/store';
import { AuthenticateState } from './store/authenticate.state';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticateRoutingModule,
    NgxsModule.forFeature([AuthenticateState]),
  ],
})
export class AuthenticateModule {}
