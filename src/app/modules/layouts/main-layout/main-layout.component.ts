import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  GetSupplies,
  GetSuppliesWarning,
} from '../../supplies/store/supply.actions';
import { Observable, Subject, take } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { AuthenticateState } from '../../authenticate/store/authenticate.state';
import { SignOut } from '../../authenticate/store/authenticate.actions';
import { SupplyState } from '../../supplies/store/supply.state';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  @Select(AuthenticateState.selectUserInformation)
  userInformation$: Observable<any>;
  @Select(SupplyState.selectWarningSupplies)
  warningSupplies$!: Observable<any[]>;
  warningSupplies!: any[];
  userInformation: any;
  showMainContent = true;
  qtyOfWarnings = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new GetSuppliesWarning());

    this.getUserInformation();
    this.getWarningSupplies();
    this.route.url.subscribe((url) => {
      this.showMainContent = this.router.url === '/main';
    });
  }

  getUserInformation(): void {
    this.userInformation$.pipe(take(1)).subscribe((ui) => {
      this.userInformation = ui;
    });
  }

  getWarningSupplies(): void {
    this.warningSupplies$.subscribe((ws) => {
      this.warningSupplies = ws;
      this.qtyOfWarnings = this.warningSupplies.length;
    });
  }

  logout(): void {
    this.store.dispatch(new SignOut()).subscribe(() => {
      this.router.navigate(['/auth']);
    });
  }
}
