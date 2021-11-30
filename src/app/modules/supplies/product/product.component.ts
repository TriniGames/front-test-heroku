import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../services/product.service';
import { StockService } from '../services/stock.service';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  displayedColumns: string[] = [
    'Id',
    'Name',
    'Description',
    'Size',
    'Unit',
    'Stock',
    'actions',
  ];
  dataSource: any[] = [];
  stockToAdd = 0;
  stockToDelete = 0;
  disableAddButton = true;
  savingStock = false;
  addStockInputToShow: number = -1;
  removeStockInputToShow: number = -1;

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly stockService: StockService
  ) {}

  ngOnInit(): void {
    this.productService
      .getProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((resp) => {
        this.dataSource = resp.product.map((prod: any) => {
          return {
            ...prod,
            TipoProducto: prod.PartialProduct ? 'Parcial' : 'Final',
          };
        });
      });
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
          this.dataSource.find((ds) => ds._id === id).Stock = product.Stock;
          this.stockToAdd = 0;
          this.savingStock = false;
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
      .addStockProduct({
        Product: id,
        Quantity: -this.stockToDelete,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (product) => {
          this.dataSource.find((ds) => ds._id === id).Stock = product.Stock;
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
