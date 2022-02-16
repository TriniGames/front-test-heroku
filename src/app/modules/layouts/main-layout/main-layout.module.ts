import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { MainLayoutComponent } from './main-layout.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { GravatarModule } from 'ngx-gravatar';
import { SpinnerModule } from 'src/app/shared/components/spinner/spinner.module';

@NgModule({
  declarations: [
    MainLayoutComponent,
    SidebarComponent,
    SidebarMenuComponent,
    HeaderComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    GravatarModule,
    MatMenuModule,
    MatBadgeModule,
    SpinnerModule,
  ],
  exports: [MainLayoutComponent],
})
export class MainLayoutModule {}
