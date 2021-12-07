import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
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
import { LookupService } from 'src/app/shared/services/lookup/lookup.service';
import { ProductService } from '../services/product.service';
import { GetProduct, GetSupplies, GetSupply } from '../store/supply.actions';
import { SupplyState } from '../store/supply.state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductSupplyType } from 'src/app/shared/enum/lookup.enum';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit-product.component.html',
  styleUrls: ['./create-edit-product.component.scss'],
})
export class CreateEditProductComponent implements OnInit, OnDestroy {
  @Select(SupplyState.selectSupplies) supplies$!: Observable<any[]>;
  @Select(SupplyState.selectProductSelected) productSelected$!: Observable<any>;
  formGroup!: FormGroup;
  suppliesForm!: FormGroup;
  error = 'Invalido';
  buttonText = 'Guardar';
  supliesOptions: any[] = [];
  suppliesChecked: Array<any> = [];
  supliesOptionsFiltered: any[] = [];
  productTypeOptions: any[] = [];
  unitOptions: any[] = [];
  helpClicked = false;
  SupliesForm!: FormArray;
  unsubscribe$ = new Subject();
  typeSelected = '0';
  bottleSupply = 0;
  damajuanaSupply = 0;
  showErroSupply = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getUnits();
    this.getSupplies();
    this.getProductType();
    this.getProduct();
    this.changeSupplyType();
    this.showAllSupply();
  }

  getUnits() {
    this.lookupService
      .lookupByName('Unit')
      .pipe(take(1))
      .subscribe((units) => (this.unitOptions = units));
  }

  changeSupplyType() {
    this.controls('Type')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((type) => {
        this.filterSupply(type);
      });
  }

  showAllSupply() {
    this.controls('ShowAllSupplies')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((showAll) => {
        if (showAll) {
          this.filterSupply('0');
        } else {
          this.filterSupply(this.controls('Type').value);
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

                    this.buttonText = 'Actualizar';
                  }

                  productSelected.Supplies.forEach((supplyInProduct: any) => {
                    const supplyControl =
                      this.getSuppliesCheckFormArray.controls.find(
                        (control) =>
                          control.get('IdSupply')?.value === supplyInProduct._id
                      );

                    if (supplyControl) {
                      const checked = supplyControl.get('Checked');
                      const qty = supplyControl.get('Quantity');
                      checked?.setValue(true);
                      qty?.setValue(supplyInProduct.Quantity);
                      qty?.enable();
                      qty?.setValidators([Validators.required]);
                      qty?.updateValueAndValidity();
                    }
                  });

                  // this.getSuppliesCheckFormArray.controls.find()
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

      this.bottleSupply = supplies.filter(
        (s) => s.Type === ProductSupplyType.Botella
      ).length;

      this.damajuanaSupply = supplies.filter(
        (s) => s.Type === ProductSupplyType.Damajuana
      ).length;

      this.supliesOptions.forEach((supplyOption) => {
        const exists = this.getSuppliesCheckFormArray.controls.some(
          (control) => control.get('IdSupply')?.value === supplyOption._id
        );

        if (!exists) {
          this.getSuppliesCheckFormArray.push(
            this.createNewSupplyCheck(supplyOption)
          );
        }
      });

      this.supliesOptionsFiltered = [...this.supliesOptions];
    });
  }

  createForm(): void {
    this.formGroup = this.formBuilder.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Description: [null],
      Size: [null, [Validators.required, , Validators.minLength(1)]],
      Unit: [
        {
          value: 'Litros',
        },
        Validators.required,
      ],
      SuppliesCheck: this.formBuilder.array([]),
      PartialProduct: [false],
      Type: [null, [Validators.required]],
      ShowAllSupplies: [false],
      MinimumStock: [null, [Validators.required]],
    });
  }

  controls(controlName: string): FormControl {
    return this.formGroup.get(controlName) as FormControl;
  }

  onSubmit(): void {
    if (!this.suppliesChecked.length) {
      this.snackBar.open('Tienes que elegir un insumo', 'Ok, elijo');

      return;
    }

    const supplies = this.suppliesChecked.map((supplyChecked) => {
      return {
        _id: supplyChecked.IdSupply,
        Quantity: supplyChecked.Quantity,
      };
    });

    const product = { ...this.formGroup.getRawValue(), Supplies: supplies };

    if (this.formGroup.get('Id')?.value) {
      this.productService.updateProduct(product).subscribe(() => {});
    } else {
      this.productService.createProduct(product).subscribe((productCreated) => {
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
    // this.getSuppliesFormArray.push(this.createNewSupply(supply));
  }

  deleteSuply(index: number): void {
    // this.getSuppliesFormArray.removeAt(index);
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

  /**
   * New way to save the products
   */

  createNewSupplyCheck(supply: any = null): FormGroup {
    return this.formBuilder.group({
      IdSupply: [supply._id ?? '', Validators.required],
      IsPartial: [supply.IsPartial ?? false],
      Checked: [false],
      Name: [{ value: supply.Name ?? '', disabled: true }],
      Quantity: [{ value: 0, disabled: true }],
      Type: [supply.Type ?? ''],
    });
  }

  get getSuppliesCheckFormArray(): FormArray {
    return this.formGroup.get('SuppliesCheck') as FormArray;
  }

  eventCheck(index: number, suplyCheck: AbstractControl) {
    const checked = suplyCheck.get('Checked')?.value;
    const qty = suplyCheck.get('Quantity');

    if (checked) {
      qty?.setValue(1);
      qty?.enable();
      qty?.setValidators([Validators.required]);
      this.suppliesChecked.push(suplyCheck.value);
    } else {
      qty?.setValue(0);
      qty?.disable();
      qty?.setValidators([]);
      this.suppliesChecked.splice(index, 1);
    }

    qty?.updateValueAndValidity();
  }

  filterSupply(type: string) {
    this.typeSelected = type;
    this.showContainer();

    this.getSuppliesCheckFormArray.controls.forEach((supply) => {
      const supplyType = supply.get('Type')?.value;
      const qty = supply.get('Quantity');
      const supplyCheck = supply.get('Checked');

      if (supplyType !== type) {
        qty?.setValue(0);
        supplyCheck?.setValue(false);
        qty?.disable();
        qty?.setValidators([]);
      }
    });
  }

  showContainer() {
    switch (this.typeSelected) {
      case ProductSupplyType.Botella:
        this.showErroSupply = this.bottleSupply < 1;
        break;

      case ProductSupplyType.Damajuana:
        this.showErroSupply = this.damajuanaSupply < 1;
        break;

      default:
        this.showErroSupply = this.damajuanaSupply < 1 && this.bottleSupply < 1;

        break;
    }
  }
}
