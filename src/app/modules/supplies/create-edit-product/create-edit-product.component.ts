import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../services/product.service';
import { GetProduct, GetSupplies, GetSupply } from '../store/supply.actions';
import { SupplyState } from '../store/supply.state';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit-product.component.html',
  styleUrls: ['./create-edit-product.component.scss'],
})
export class CreateEditProductComponent implements OnInit, OnDestroy {
  @Select(SupplyState.selectSupplies) supplies$!: Observable<any[]>;
  @Select(SupplyState.selectProductSelected) productSelected$!: Observable<any>;
  formGroup!: FormGroup;
  error = 'Invalido';
  buttonText = 'Guardar';
  supliesOptions: any[] = [];
  supliesOptionsFiltered: any[] = [];
  productTypeOptions: any[] = [];
  helpClicked = false;
  SupliesForm!: FormArray;
  unsubscribe$ = new Subject();

  constructor(
    private _formBuilder: FormBuilder,
    private _productService: ProductService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getSupplies();
    this.getProductType();
    this.getProduct();

    this.controls('Type').valueChanges.subscribe((type) => {
      this.changeSupplies(type);
    });

    this.controls('ShowAllSupplies').valueChanges.subscribe((showAll) => {
      if (showAll) {
        this.showAllSupplies();
      }
    });
  }

  getProduct(): void {
    this._route.queryParams.subscribe((params) => {
      if (params && params['id']) {
        this._store.dispatch(new GetProduct(params['id'])).subscribe(
          () => {
            this.productSelected$
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((productSelected) => {
                console.log({ productSelected });
                if (productSelected) {
                  this.formGroup.patchValue({
                    ...productSelected,
                    Id: productSelected._id,
                  });

                  const supliesArray = this.formGroup.get(
                    'Supplies'
                  ) as FormArray;

                  this.deleteSuply(0);

                  productSelected.Supplies.forEach((supply: any) => {
                    supliesArray.push(
                      this.createNewSupply(supply.SingleSupply)
                    );
                  });

                  this.buttonText = 'Actualizar';
                }
              });
          },
          (err) => {
            this._router.navigate(['main', 'supplies', 'createEditProduct']);
          }
        );
      }
    });
  }

  getProductType(): void {
    this.productTypeOptions = [
      { _id: '1', Name: `Damajuana` },
      { _id: '2', Name: `Botella` },
      { _id: '3', Name: `Otro` },
    ];
  }

  getSupplies(): void {
    this._store.dispatch(new GetSupplies());

    this.supplies$.pipe(takeUntil(this.unsubscribe$)).subscribe((supplies) => {
      if (!supplies) {
        return;
      }

      this.supliesOptions = supplies.map((supply) => {
        return {
          ...supply,
          Name: supply.IsPartial ? `${supply.Name} - Parcial` : supply.Name,
        };
      });

      this.supliesOptionsFiltered = [...this.supliesOptions];
    });
  }

  createForm(): void {
    this.formGroup = this._formBuilder.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Description: [null, Validators.required],
      Size: [null, [Validators.required, , Validators.minLength(1)]],
      Unit: [
        {
          value: 'Litros',
          disabled: true,
        },
      ],
      Supplies: this._formBuilder.array([this.createNewSupply()]),
      PartialProduct: [false],
      Type: [null, [Validators.required]],
      ShowAllSupplies: [false],
    });
  }

  controls(controlName: string): FormControl {
    return this.formGroup.get(controlName) as FormControl;
  }

  formArrays(controlName: string): FormArray {
    return this.formGroup.get(controlName) as FormArray;
  }

  onSubmit(): void {
    if (this.formGroup.get('Id')?.value) {
      this._productService
        .updateProduct(this.formGroup.getRawValue())
        .subscribe(() => {});
    } else {
      this._productService
        .createProduct(this.formGroup.getRawValue())
        .subscribe((productCreated) => {
          console.log({ productCreated });
          this._router.navigate([], {
            relativeTo: this._route,
            queryParams: {
              id: productCreated._id,
            },
            queryParamsHandling: 'merge',
          });
        });
    }
  }

  openHelp(): void {
    this.helpClicked = !this.helpClicked;
  }

  addSupply(supply: any = null): void {
    const supliesArray = this.formGroup.get('Supplies') as FormArray;
    supliesArray.push(this.createNewSupply(supply));
  }

  deleteSuply(index: number): void {
    const supliesArray = this.formGroup.get('Supplies') as FormArray;
    supliesArray.removeAt(index);
  }

  createNewSupply(supply: any = null): FormGroup {
    return this._formBuilder.group({
      SingleSupply: [supply, Validators.required],
    });
  }

  changeSupplies(type: string): void {
    if (!this.controls('ShowAllSupplies').value) {
      this.supliesOptionsFiltered = this.supliesOptions.filter(
        (p) => p.Type === type
      );
    }
  }

  showAllSupplies(): void {
    this.supliesOptionsFiltered = this.supliesOptions;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }
}
