import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ProductService } from '../../supplies/services/product.service';
import { ProductionNode } from 'src/app/shared/models/tree/production-node.model';
import { StockProduct } from 'src/app/shared/models/stock/product-supply.model';
import { StockService } from '../../supplies/services/stock.service';
import { StockSupply } from 'src/app/shared/models/stock/stock-supply.model';
import { SupplyService } from '../../supplies/services/supply.service';

@Component({
  selector: 'app-main-production',
  templateUrl: './main-production.component.html',
  styleUrls: ['./main-production.component.scss'],
})
export class MainProductionComponent implements OnInit, OnDestroy {
  panelOpenState = false;
  treeProductionBottleData: ProductionNode[] = [];
  treeProductionDamajuanaData: ProductionNode[] = [];
  treeControl = new NestedTreeControl<ProductionNode>((node) => node.children);
  dataSourceDamajuanas = new MatTreeNestedDataSource<ProductionNode>();
  dataSourceBottles = new MatTreeNestedDataSource<ProductionNode>();
  itemsToProduce: ProductionNode[] = [];
  unsubscribe$ = new Subject();
  supplies = [];
  partialProducts = [];
  production: any;
  productionOnGoing = false;
  maximumProductionPossibleExceeded = false;
  error = 'No se puede producir mas de lo que esta permitido';

  constructor(
    private readonly productService: ProductService,
    private readonly supplyService: SupplyService,
    private readonly stockService: StockService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  calculateProductionCapability(): void {}

  checkSuppliesToProduce(e: any, nodeInfo: ProductionNode): void {
    if (e.checked) {
      this.itemsToProduce.push(nodeInfo);
    } else {
      this.itemsToProduce = this.itemsToProduce.filter(
        (items) => items.index !== nodeInfo.index
      );
    }
  }

  disabledProductionButton(nodeInfo: ProductionNode): boolean {
    if (this.productionOnGoing) {
      return this.productionOnGoing;
    }

    if (this.maximumProductionPossibleExceeded) {
      return this.maximumProductionPossibleExceeded;
    }

    let itIsToProduce = false;

    nodeInfo.children!.forEach((child) => {
      if (this.itemsToProduce.some((items) => items.index === child.index)) {
        itIsToProduce = true;
      }
    });

    return !itIsToProduce;
  }

  disableInputStock(node: ProductionNode): boolean {
    return !this.itemsToProduce.some(
      (item) => item.idProduct === node.idProduct
    );
  }

  evaluateStock(e: any, node: ProductionNode): void {
    const itemToProduce = this.itemsToProduce.find(
      (item) => item.idProduct === node.idProduct
    );

    if (itemToProduce) {
      itemToProduce.quantityToProduce = e.target.value;
    }

    const stock = node?.stock || 0;

    this.maximumProductionPossibleExceeded = e.target.value > stock;
  }

  generateProduction(nodeInfo: ProductionNode): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: {
        confirmMessage: 'Si, a producir',
        cancelMessage: 'No, por ahora no',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productionOnGoing = true;

        const indexToProduce = nodeInfo.children
          ? nodeInfo.children[0].index
          : 0;

        const production = this.itemsToProduce.find(
          (itp) => itp.index === indexToProduce
        );

        // console.log({
        //   nodeInfo,
        //   itemsToProduce: this.itemsToProduce,
        //   production,
        // });

        const supplies: string[] = [];
        const partialProducts: string[] = [];

        if (production) {
          production!.ids!.forEach((supply) => {
            const supplyToConsume: any = this.supplies.find(
              (p: any) => p._id === supply._id
            );

            if (supplyToConsume) {
              supplies.push({ ...supplyToConsume, Quantity: supply.Quantity });
            } else {
              const partialProductToConsume: any = this.partialProducts.find(
                (p: any) => p._id === supply._id
              );

              if (partialProductToConsume) {
                partialProducts.push({
                  ...partialProductToConsume,
                  Quantity: partialProductToConsume.Quantity,
                });
              }
            }
          });

          this.consumeStock(supplies, partialProducts, production);
        }
      }
    });
  }

  getProducts(): void {
    this.productService
      .getProducts()
      .pipe(take(1))
      .subscribe((resp) => {
        this.supplyService
          .getSuppliesAndPartialProducts()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((supplies) => {
            this.supplies = supplies.supply;

            resp.product.forEach((product: any, index: number) => {
              const suppliesParsedList = JSON.parse(product.Supplies);
              const childrens: any[] = [];

              suppliesParsedList.forEach((suppliesParsed: any) => {
                const stockAvailable = this.getStockAvailable(suppliesParsed);

                const minStockSupply = stockAvailable.reduce((prev, curr) => {
                  return Math.trunc(prev.Stock / parseInt(prev.Quantity)) <
                    Math.trunc(curr.Stock / parseInt(curr.Quantity))
                    ? prev
                    : curr;
                });

                const children = {
                  name: suppliesParsed
                    .map((sp: any) => {
                      return this.getSupplyName(sp._id, supplies.supply);
                    })
                    .join(' - '),
                  ids: suppliesParsed,
                  idProduct: product._id,
                  index,
                  stock: Math.trunc(
                    minStockSupply.Stock / minStockSupply.Quantity
                  ),
                  stockDetail: stockAvailable
                    .map((sa) => {
                      return `${sa.Name} - ${sa.Stock}`;
                    })
                    .join(' / '),
                };

                childrens.push(children);
              });

              if (product.Type == 1) {
                this.treeProductionDamajuanaData.push({
                  name: product.Name,
                  children: childrens,
                });
              } else {
                this.treeProductionBottleData.push({
                  name: product.Name,
                  children: childrens,
                });
              }
            });

            this.dataSourceDamajuanas.data = this.treeProductionDamajuanaData;

            this.dataSourceBottles.data = this.treeProductionBottleData;
          });
      });
  }

  getStockAvailable(ids: any[]): any[] {
    const stocks: any[] = [];

    ids.forEach((supplyDetails) => {
      const supply: any = this.supplies.find(
        (s: any) => s._id === supplyDetails._id
      );

      stocks.push({ ...supply, Quantity: supplyDetails.Quantity });
    });

    return stocks;
  }

  hasChild = (_: number, node: ProductionNode) =>
    !!node.children && node.children.length > 0;

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  private getSupplyName(id: string, supplies: any[]): string {
    return supplies.find((p) => p._id === id).Name;
  }

  private consumeStock(
    supplies: any[],
    partialProducts: any[],
    production: any
  ): void {
    console.log({ supplies, partialProducts, production });
    const subs: Observable<any>[] = [];

    if (supplies && supplies.length) {
      supplies.forEach((supply) => {
        subs.push(
          this.stockService.addStockSupply(
            new StockSupply(
              -Number(production.quantityToProduce * supply.Quantity),
              supply._id
            )
          )
        );
      });
    }

    if (partialProducts && partialProducts.length) {
      partialProducts.forEach((partialProduct) => {
        subs.push(
          this.stockService.addStockProduct(
            new StockProduct(
              -Number(production.quantityToProduce * partialProduct.Quantity),
              partialProduct._id
            )
          )
        );
      });
    }

    subs.push(
      this.stockService.addStockProduct(
        new StockProduct(
          Number(production.quantityToProduce),
          production.idProduct
        )
      )
    );

    forkJoin(subs)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((results) => {
        this.productionOnGoing = false;
        location.reload();
      });
  }
}
