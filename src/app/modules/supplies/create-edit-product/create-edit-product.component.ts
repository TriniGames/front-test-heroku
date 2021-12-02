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
import { take, takeUntil } from 'rxjs/operators';
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
    private readonly formBuilder: FormBuilder,
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getSupplies();
    this.getProductType();
    this.getProduct();
    this.changeSupplyType();
    this.showAllSupply();
  }

  changeSupplyType() {
    this.controls('Type')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((type) => {
        this.changeSupplies(type);
      });
  }

  showAllSupply() {
    this.controls('ShowAllSupplies')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((showAll) => {
        if (showAll) {
          this.showAllSupplies();
        }
      });
  }

  getProduct(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        if (params && params['id']) {
          this.store.dispatch(new GetProduct(params['id'])).subscribe(
            () => {
              this.productSelected$
                .pipe(take(1))
                .subscribe((productSelected) => {
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
              this.router.navigate(['main', 'supplies', 'createEditProduct']);
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
    this.store.dispatch(new GetSupplies());

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
    this.formGroup = this.formBuilder.group({
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
      Supplies: this.formBuilder.array([this.createNewSupply()]),
      PartialProduct: [false],
      Type: [null, [Validators.required]],
      ShowAllSupplies: [false],
    });
  }

  controls(controlName: string): FormControl {
    return this.formGroup.get(controlName) as FormControl;
  }

  onSubmit(): void {
    if (this.formGroup.get('Id')?.value) {
      this.productService
        .updateProduct(this.formGroup.getRawValue())
        .subscribe(() => {});
    } else {
      this.productService
        .createProduct(this.formGroup.getRawValue())
        .subscribe((productCreated) => {
          this.router.navigate([], {
            relativeTo: this.route,
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
    this.getSuppliesFormArray.push(this.createNewSupply(supply));
  }

  deleteSuply(index: number): void {
    this.getSuppliesFormArray.removeAt(index);
  }

  get getSuppliesFormArray(): FormArray {
    return this.formGroup.get('Supplies') as FormArray;
  }

  createNewSupply(supply: any = null): FormGroup {
    return this.formBuilder.group({
      SingleSupply: [supply, Validators.required],
      SupplyQuantities: this.formBuilder.array([]),
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

  backToList(): void {
    this.router.navigate(['/main/supplies/supplies']);
  }

  clearForm(): void {
    this.formGroup.reset();

    this.router.navigate([], {
      relativeTo: this.route,
    });

    this.buttonText = 'Guardar';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }
}
