import { Injectable } from '@angular/core';
import { State, Selector, Action } from '@ngxs/store';
import { StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ProductService } from '../services/product.service';
import { SupplyService } from '../services/supply.service';
import {
  GetPartialProducts,
  GetProduct,
  GetSupplies,
  GetSupply,
} from './supply.actions';

export interface Supply {
  supplies: any[];
  supplySelected: any;
  productSelected: any;
}

@State<Supply>({
  name: 'supply',
  defaults: {
    supplies: [],
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

  @Action(GetSupplies)
  getSupplies(context: StateContext<Supply>, action: GetSupplies) {
    return this.supplyService.getSupplies().pipe(
      tap((resp) => {
        context.patchState({
          supplies: resp.supply.map((s: any) => {
            return { ...s, TypeDescription: this.typeName(s.Type) };
          }),
        });

        context.dispatch(new GetPartialProducts());
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
  GetProduct(context: StateContext<Supply>, action: GetProduct) {
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
