import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './shared/interceptors/auth-interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { SpinnerModule } from './shared/components/spinner/spinner.module';
import { NgxsModule } from '@ngxs/store';
import { AuthenticateState } from './modules/authenticate/store/authenticate.state';
import { environment } from 'src/environments/environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { OnlydigitsDirective } from './shared/directives/onlydigits.directive';
import { MainLayoutModule } from './modules/layouts/main-layout/main-layout.module';
import { ConfirmationDialogModule } from './shared/components/confirmation-dialog/confirmation-dialog.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SupplyState } from './modules/supplies/store/supply.state';
@NgModule({
  declarations: [AppComponent, OnlydigitsDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OverlayModule,
    ConfirmationDialogModule,
    SpinnerModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatExpansionModule,
    MainLayoutModule,
    MatGridListModule,
    MatButtonModule,
    MatCardModule,
    NgxsModule.forRoot([AuthenticateState, SupplyState], {
      developmentMode: !environment.production,
    }),
    NgxsStoragePluginModule.forRoot(),
    MatDialogModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
