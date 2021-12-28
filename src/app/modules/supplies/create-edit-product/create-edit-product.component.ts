import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  GetProduct,
  GetSupplies,
  GetSuppliesWarning,
} from '../store/supply.actions';
import { Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { take, takeUntil } from 'rxjs/operators';

import { LookupService } from 'src/app/shared/services/lookup/lookup.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../services/product.service';
import { ProductSupplyType } from 'src/app/shared/enum/lookup.enum';
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
  suppliesForm!: FormGroup;
  error = 'Invalido';
  buttonText = 'Guardar';
  suppliesOptions: any[] = [];
  suppliesChecked: Array<any> = [];
  suppliesOptionsFiltered: any[] = [];
  productTypeOptions: any[] = [];
  unitOptions: any[] = [];
  helpClicked = false;
  SuppliesForm!: FormArray;
  unsubscribe$ = new Subject();
  typeSelected = '0';
  bottleSupply = 0;
  demijohnSupply = 0;
  showErrorSupply = false;
  existingOptions = false;

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
          this.store
            .dispatch(new GetProduct(params['id']))
            .pipe(take(1))
            .subscribe(
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

                    productSelected.Supplies.forEach(
                      (supplyInProduct: any, index: number) => {
                        if (index === 0) {
                          supplyInProduct.forEach((sip: any) => {
                            const suppliesOptions = (
                              this.formGroup.controls[
                                'SuppliesCheckArray'
                              ] as FormArray
                            )
                              .at(index)
                              .get('SuppliesOptions') as FormArray;

                            const supplyControl = suppliesOptions.controls.find(
                              (sc) => {
                                return sc.get('IdSupply')?.value == sip._id;
                              }
                            );

                            const partialProduct =
                              suppliesOptions.controls.findIndex(
                                (control) =>
                                  control.get('IdSupply')?.value ===
                                  params['id']
                              );

                            if (partialProduct >= 0) {
                              suppliesOptions.removeAt(partialProduct);
                            }

                            if (supplyControl) {
                              const checked = supplyControl.get('Checked');
                              const qty = supplyControl.get('Quantity');
                              checked?.setValue(true);
                              qty?.setValue(sip.Quantity);
                              qty?.enable();
                              qty?.setValidators([Validators.required]);
                              qty?.updateValueAndValidity();
                            }
                          });
                        } else {
                          this.addNewSupplyCheck();

                          supplyInProduct.forEach((sip: any) => {
                            const suppliesOptions = (
                              this.formGroup.controls[
                                'SuppliesCheckArray'
                              ] as FormArray
                            )
                              .at(index)
                              .get('SuppliesOptions') as FormArray;

                            const supplyControl = suppliesOptions.controls.find(
                              (sc) => {
                                return sc.get('IdSupply')?.value == sip._id;
                              }
                            );

                            const partialProduct =
                              suppliesOptions.controls.findIndex(
                                (control) =>
                                  control.get('IdSupply')?.value ===
                                  params['id']
                              );

                            if (partialProduct >= 0) {
                              suppliesOptions.removeAt(partialProduct);
                            }

                            if (supplyControl) {
                              const checked = supplyControl.get('Checked');
                              const qty = supplyControl.get('Quantity');
                              checked?.setValue(true);
                              qty?.setValue(sip.Quantity);
                              qty?.enable();
                              qty?.setValidators([Validators.required]);
                              qty?.updateValueAndValidity();
                            }
                          });
                        }
                      }
                    );
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

    this.supplies$.pipe(take(1)).subscribe((supplies) => {
      if (!supplies) {
        return;
      }

      this.suppliesOptions = supplies.map((supply) => {
        return {
          ...supply,
          Name: supply.IsPartial ? `${supply.Name} - Parcial` : supply.Name,
        };
      });

      this.bottleSupply = supplies.filter(
        (s) => s.Type === ProductSupplyType.Botella
      ).length;

      this.demijohnSupply = supplies.filter(
        (s) => s.Type === ProductSupplyType.Damajuana
      ).length;

      this.suppliesOptionsFiltered = [...this.suppliesOptions];

      (this.formGroup.get('SuppliesCheckArray') as FormArray).push(
        this.createNewSupplyCheckArray()
      );
      this.existingOptions = true;
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
      PartialProduct: [false],
      Type: [null, [Validators.required]],
      ShowAllSupplies: [false],
      MinimumStock: [null, [Validators.required]],
      SuppliesCheckArray: this.formBuilder.array([]),
    });
  }

  controls(controlName: string): FormControl {
    return this.formGroup.get(controlName) as FormControl;
  }

  onSubmit(): void {
    const supplies = this.getSuppliesCheckArray(this.formGroup);
    const supplyToSave: any[] = [];

    supplies.forEach((suppliesChecked: any) => {
      const supplyCheckedToSave: any[] = [];

      (suppliesChecked.get('SuppliesOptions') as FormArray).controls.forEach(
        (sc) => {
          if (sc.get('Checked')?.value) {
            supplyCheckedToSave.push({
              _id: sc.get('IdSupply')?.value,
              Quantity: sc.get('Quantity')?.value,
            });
          }
        }
      );

      supplyToSave.push(supplyCheckedToSave);
    });

    const product = { ...this.formGroup.getRawValue(), Supplies: supplyToSave };

    if (this.formGroup.get('Id')?.value) {
      this.productService.updateProduct(product).subscribe(() => {
        this.store.dispatch(new GetSuppliesWarning());
      });
    } else {
      this.productService.createProduct(product).subscribe((productCreated) => {
        this.store.dispatch(new GetSuppliesWarning());
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
      this.suppliesOptionsFiltered = this.suppliesOptions.filter(
        (p) => p.Type === type
      );
    }
  }

  showAllSupplies(): void {
    this.suppliesOptionsFiltered = this.suppliesOptions;
  }

  backToList(): void {
    this.router.navigate(['/main/supplies/products']);
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
      IdSupply: [supply._id ?? ''],
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

  filterSupply(type: string): void {
    this.typeSelected = type;
    // this.showContainer();

    // this.getSuppliesCheckFormArray.controls.forEach((supply) => {
    //   const supplyType = supply.get('Type')?.value;
    //   const qty = supply.get('Quantity');
    //   const supplyCheck = supply.get('Checked');

    //   if (supplyType !== type) {
    //     qty?.setValue(0);
    //     supplyCheck?.setValue(false);
    //     qty?.disable();
    //     qty?.setValidators([]);
    //   }
    // });
  }

  showContainer() {
    switch (this.typeSelected) {
      case ProductSupplyType.Botella:
        this.showErrorSupply = this.bottleSupply < 1;
        break;

      case ProductSupplyType.Damajuana:
        this.showErrorSupply = this.demijohnSupply < 1;
        break;

      default:
        this.showErrorSupply = this.demijohnSupply < 1 && this.bottleSupply < 1;
        break;
    }
  }

  /**
   * New new Way to do it
   */

  createNewSupplyCheckArray(): FormGroup {
    if (this.suppliesOptions.length) {
      const options = this.suppliesOptions.map((supply) => {
        return this.formBuilder.group({
          IdSupply: [supply._id ?? ''],
          IsPartial: [supply.IsPartial ?? false],
          Checked: [false],
          Name: [{ value: supply.Name ?? '', disabled: true }],
          Quantity: [{ value: 0, disabled: true }],
          Type: [supply.Type ?? ''],
        });
      });

      return this.formBuilder.group({
        SuppliesOptions: this.formBuilder.array(options),
      });
    }

    return this.formBuilder.group({
      SuppliesOptions: this.formBuilder.array([
        this.formBuilder.group({
          IdSupply: [''],
          IsPartial: [false],
          Checked: [false],
          Name: [{ value: '', disabled: true }],
          Quantity: [{ value: 0, disabled: true }],
          Type: [''],
        }),
      ]),
    });
  }

  getSuppliesCheckArray(form: any) {
    return form.controls.SuppliesCheckArray.controls;
  }

  getSuppliesOptionsArray(form: any) {
    return form.controls.SuppliesOptions.controls;
  }

  addNewSupplyCheck() {
    (this.formGroup.controls['SuppliesCheckArray'] as FormArray).push(
      this.createNewSupplyCheckArray(),
      { emitEvent: false }
    );
  }

  deleteNewSupplyCheck(index: number) {
    (this.formGroup.controls['SuppliesCheckArray'] as FormArray).removeAt(
      index,
      { emitEvent: false }
    );
  }
}
