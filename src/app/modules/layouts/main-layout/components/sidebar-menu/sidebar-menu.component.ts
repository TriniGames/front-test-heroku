import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  @Input() navigation: any[];
  @Input() separator = false;
  @Output() openSubmenu = new EventEmitter();

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  isSelected(path: string): boolean {
    return this.router.url.split('/')[1] === path;
  }

  toggleSubmenu(nav: any): void {
    this.navigation.forEach(n => {
      if (nav.path !== n.path) {
        n.navOpen = false;
      }
    });
    nav.navOpen = !nav.navOpen;
    this.openSubmenu.emit(nav);
  }

}
