import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { mainNavigation } from 'src/app/shared/constants';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  navigation: any[] = [];
  navigationBottom: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navigation = mainNavigation;
  }

  onOpenSubmenu(nav: any): void {
    this.navigation.forEach((n) => {
      if (nav.path !== n.path) {
        n.navOpen = false;
      }
    });
    this.navigationBottom.forEach((n) => {
      if (nav.path !== n.path) {
        n.navOpen = false;
      }
    });
  }
}
