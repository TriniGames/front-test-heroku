import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { take, takeUntil } from 'rxjs/operators';

import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import EnumHelper from 'src/app/shared/helpers/enum.helper';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from 'src/app/shared/models/supplies/product.model';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';
import { StockService } from '../services/stock.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = [
    'Index',
    'Name',
    'TypeDescription',
    'Size',
    'Unit',
    'Stock',
    'actions',
  ];
  dataSource: Product[] = [];
  dataSourceMatTable: any;
  stockToAdd = 0;
  stockToDelete = 0;
  disableAddButton = true;
  savingStock = false;
  addStockInputToShow: number = -1;
  removeStockInputToShow: number = -1;

  constructor(
    private readonly dialog: MatDialog,
    private readonly liveAnnouncer: LiveAnnouncer,
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly stockService: StockService
  ) {}

  ngOnInit(): void {
    this.productService
      .getProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((resp) => {
        this.dataSource = resp.product.map((prod: Product, index: number) => {
          return {
            ...prod,
            Index: index + 1,
            TipoProducto: prod.PartialProduct ? 'Parcial' : 'Final',
            TypeDescription: EnumHelper.typeName(prod.Type),
          };
        });

        this.dataSourceMatTable = new MatTableDataSource(this.dataSource);
        this.dataSourceMatTable.sort = this.sort;
        this.dataSourceMatTable.filterPredicate = (
          data: Product,
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

  addStock(id: string): void {
    if (this.stockToAdd < 0) {
      return;
    }

    this.savingStock = true;
    this.stockService
      .addStockProduct({
        Product: id,
        Quantity: this.stockToAdd,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (product) => {
          const productFound = this.dataSource.find(
            (ds: Product) => ds._id === id
          );

          if (productFound) {
            productFound.Stock = product.Stock;
          }

          this.stockToAdd = 0;
          this.savingStock = false;
        },
        (err) => {
          this.savingStock = false;
          console.log(err);
        }
      );
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
  }

  deleteStock(id: string): void {
    if (this.stockToDelete < 0) {
      return;
    }

    this.savingStock = true;

    this.stockService
      .addStockProduct({
        Product: id,
        Quantity: -this.stockToDelete,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (product) => {
          const productFound = this.dataSource.find(
            (ds: Product) => ds._id === id
          );

          if (productFound) {
            productFound.Stock = product.Stock;
          }

          this.savingStock = false;
          this.stockToDelete = 0;
        },
        (err) => {
          this.savingStock = false;
          console.log(err);
        }
      );
  }

  createProduct(): void {
    this.router.navigate(['main', 'supplies', 'createEditProduct']);
  }

  deleteProduct(event: any): void {
    console.log({ event });
  }

  deleteSupply(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { confirmMessage: 'Eliminar', cancelMessage: 'No, por ahora no' },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.productService
          .deleteProduct(id)
          .pipe(take(1))
          .subscribe(() => {
            const index = this.dataSourceMatTable.data.indexOf(id);
            this.dataSourceMatTable.data.splice(index, 1);
            this.dataSourceMatTable._updateChangeSubscription();
          });
      }
    });
  }

  editProduct(event: any): void {
    this.router.navigate(['main', 'supplies', 'createEditProduct'], {
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
