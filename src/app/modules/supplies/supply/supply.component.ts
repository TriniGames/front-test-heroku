import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GetSupplies, GetSuppliesWarning } from '../store/supply.actions';
import { MatSort, Sort } from '@angular/material/sort';

import EnumHelper from 'src/app/shared/helpers/enum.helper';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { StockService } from '../services/stock.service';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { Supply } from 'src/app/shared/models/supplies/supply.model';
import { SupplyService } from '../services/supply.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supply',
  templateUrl: './supply.component.html',
  styleUrls: ['./supply.component.scss'],
})
export class SupplyComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = [
    'Index',
    'Name',
    'TypeDescription',
    'Stock',
    'actions',
  ];
  dataSourceMatTable: any;
  dataSource: Supply[] = [];
  stockToAdd = 0;
  stockToDelete = 0;
  disableAddButton = true;
  savingStock = false;
  addStockInputToShow: number = -1;
  removeStockInputToShow: number = -1;

  constructor(
    private readonly liveAnnouncer: LiveAnnouncer,
    private readonly router: Router,
    private readonly supplyService: SupplyService,
    private readonly stockService: StockService,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.supplyService
      .getSupplies()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((resp) => {
        this.dataSource = resp.supply.map((sup: Supply, index: number) => {
          return {
            ...sup,
            Index: index + 1,
            TypeDescription: EnumHelper.typeName(sup.Type),
          };
        });

        this.dataSourceMatTable = new MatTableDataSource(this.dataSource);
        this.dataSourceMatTable.sort = this.sort;
        this.dataSourceMatTable.filterPredicate = (
          data: Supply,
          filter: string
        ) => data.Name?.trim().toLowerCase().indexOf(filter) != -1;
      });
  }

  applyFilter(event: any) {
    let filter = event.target.value ?? '';
    filter = filter.trim();
    filter = filter.toLowerCase();
    this.dataSourceMatTable.filter = filter;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
  }

  addStock(id: string): void {
    if (this.stockToAdd < 0) {
      return;
    }

    this.savingStock = true;
    this.stockService
      .addStockSupply({
        Supply: id,
        Quantity: this.stockToAdd,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (supply) => {
          this.store.dispatch(new GetSuppliesWarning());
          this.dataSource.find((ds) => ds._id === id)!.Stock = supply.Stock;
          this.stockToAdd = 0;
          this.savingStock = false;
          this.store.dispatch(new GetSupplies());
        },
        (err) => {
          this.savingStock = false;
          console.log(err);
        }
      );
  }

  deleteStock(id: string): void {
    if (this.stockToDelete < 0) {
      return;
    }

    this.savingStock = true;

    this.stockService
      .addStockSupply({
        Supply: id,
        Quantity: -this.stockToDelete,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (supply) => {
          this.store.dispatch(new GetSuppliesWarning());
          const supplyFound = this.dataSource.find((ds) => ds._id === id);

          if (supplyFound) {
            supplyFound.Stock = supply.Stock;
          }

          this.savingStock = false;
          this.stockToDelete = 0;
          this.store.dispatch(new GetSupplies());
        },
        (err) => {
          this.savingStock = false;
          console.log(err);
        }
      );
  }

  createSupply(): void {
    this.router.navigate(['main', 'supplies', 'createEditSupply']);
  }

  deleteSupply(event: any): void {
    console.log({ event });
  }

  editSupply(event: any): void {
    this.router.navigate(['main', 'supplies', 'createEditSupply'], {
      queryParams: { id: event },
    });
  }

  onChangeStock(value: number): void {
    this.disableAddButton = !value || value <= 0;
  }

  showAddInput(index: number): void {
    this.stockToAdd = 0;
    this.addStockInputToShow = index;
    this.removeStockInputToShow = -1;
  }

  showRemoveInput(index: number): void {
    this.stockToDelete = 0;
    this.removeStockInputToShow = index;
    this.addStockInputToShow = -1;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }
}
