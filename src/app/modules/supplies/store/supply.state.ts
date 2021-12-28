import { Action, Selector, State } from '@ngxs/store';
import {
  GetPartialProducts,
  GetProduct,
  GetSupplies,
  GetSuppliesWarning,
  GetSupply,
} from './supply.actions';

import { Injectable } from '@angular/core';
import { ProductService } from '../services/product.service';
import { StateContext } from '@ngxs/store';
import { SupplyService } from '../services/supply.service';
import { tap } from 'rxjs/operators';

export interface Supply {
  supplies: any[];
  supplySelected: any;
  warningSupplies: any;
  productSelected: any;
}

@State<Supply>({
  name: 'supply',
  defaults: {
    supplies: [],
    warningSupplies: [],
    supplySelected: null,
    productSelected: null,
  },
})
@Injectable()
export class SupplyState {
  constructor(
    private productService: ProductService,
    private supplyService: SupplyService
  ) {}

  @Selector()
  static selectSupplies(state: Supply) {
    return state.supplies;
  }

  @Selector()
  static selectSupplySelected(state: Supply) {
    return state.supplySelected;
  }

  @Selector()
  static selectProductSelected(state: Supply) {
    return state.productSelected;
  }

  @Selector()
  static selectWarningSupplies(state: Supply) {
    return state.warningSupplies;
  }

  @Action(GetSupplies)
  getSupplies(context: StateContext<Supply>, action: GetSupplies) {
    return this.supplyService.getSuppliesAndPartialProducts().pipe(
      tap((resp) => {
        context.patchState({
          supplies: resp.supply.map((s: any) => {
            return { ...s, TypeDescription: this.typeName(s.Type) };
          }),
          warningSupplies: resp.supply.filter(
            (s: any) => s.Stock <= s.MinimumStock
          ),
        });
      })
    );
  }

  @Action(GetPartialProducts)
  getPartialProducts(
    context: StateContext<Supply>,
    action: GetPartialProducts
  ) {
    const state = context.getState();

    return this.productService.getPartialProducts().pipe(
      tap((partial) => {
        let newSupplies = state.supplies;
        let finalPartialProducts: any[] = [];

        const partialProducts = partial.product.map((pp: any) => {
          return {
            _id: pp._id,
            Name: pp.Name,
            IsPartial: true,
            TypeDescription: this.typeName(pp.Type),
            Type: pp.Type,
          };
        });

        partialProducts.forEach((pp: any) => {
          if (!newSupplies.some((nn) => nn._id == pp._id)) {
            finalPartialProducts.push(pp);
          }
        });

        context.patchState({
          supplies: newSupplies.concat(finalPartialProducts),
        });
      })
    );
  }

  @Action(GetSupply)
  getSupply(context: StateContext<Supply>, action: GetSupply) {
    return this.supplyService.getSupply(action.Id).pipe(
      tap((resp) => {
        context.patchState({
          supplySelected: resp.supply,
        });
      })
    );
  }

  @Action(GetProduct)
  getProduct(context: StateContext<Supply>, action: GetProduct) {
    return this.productService.getProduct(action.Id).pipe(
      tap(
        (resp) => {
          context.patchState({
            productSelected: {
              ...resp.product,
              Supplies: JSON.parse(resp.product.Supplies),
            },
          });
        },
        (error) => {
          console.error('error', error);
        }
      )
    );
  }

  @Action(GetSuppliesWarning)
  getSuppliesWarning(context: StateContext<Supply>, action: GetSupplies) {
    return this.supplyService.getSuppliesAndPartialProducts().pipe(
      tap((resp) => {
        context.patchState({
          warningSupplies: resp.supply.filter(
            (s: any) => s.Stock <= s.MinimumStock
          ),
        });
      })
    );
  }

  typeName(type: string) {
    switch (type) {
      case '1':
        return 'Damajuana';
      case '2':
        return 'Botella';
      case '3':
        return 'Otro';
      default:
        return '';
    }
  }
}
