import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GetSuppliesWarning, GetSupply } from '../store/supply.actions';
import { Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { SupplyService } from '../services/supply.service';
import { SupplyState } from '../store/supply.state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-create-edit-supply',
  templateUrl: './create-edit-supply.component.html',
  styleUrls: ['./create-edit-supply.component.scss'],
})
export class CreateEditSupplyComponent implements OnInit {
  @Select(SupplyState.selectSupplySelected) supplySelected$!: Observable<any>;
  unsubscribe$ = new Subject();
  formGroup!: FormGroup;
  error = 'Invalido';
  buttonText = 'Guardar';
  helpClicked = false;
  productTypeOptions: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _supplyService: SupplyService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getProductType();
    this.getSupply();
  }

  getProductType() {
    this.productTypeOptions = [
      { _id: '1', Name: `Damajuana` },
      { _id: '2', Name: `Botella` },
      { _id: '3', Name: `Otro` },
    ];
  }

  getSupply() {
    this._route.queryParams.subscribe((params) => {
      if (params && params['id']) {
        this._store.dispatch(new GetSupply(params['id'])).subscribe(
          () => {
            this.supplySelected$
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((supplySelected) => {
                if (supplySelected) {
                  this.formGroup.patchValue({
                    ...supplySelected,
                    Id: supplySelected._id,
                  });

                  this.buttonText = 'Actualizar';
                }
              });
          },
          (err) => {
            this._router.navigate(['main', 'supplies', 'createEditSupply']);
          }
        );
      }
    });
  }

  createForm() {
    this.formGroup = this._formBuilder.group({
      Id: [null],
      Name: [null, [Validators.required]],
      Description: [null],
      Type: [null, [Validators.required]],
      MinimumStock: [null, [Validators.required]],
    });
  }

  controls(controlName: string) {
    return this.formGroup.get(controlName) as FormControl;
  }

  onSubmit() {
    if (this.formGroup.get('Id')?.value) {
      this._supplyService
        .updateSupply(this.formGroup.getRawValue())
        .subscribe(() => {
          this._store.dispatch(new GetSuppliesWarning());
        });
    } else {
      this._supplyService
        .createSupply(this.formGroup.getRawValue())
        .subscribe((supplyCreated) => {
          this._store.dispatch(new GetSuppliesWarning());
          this._router.navigate([], {
            relativeTo: this._route,
            queryParams: {
              id: supplyCreated._id,
            },
            queryParamsHandling: 'merge',
          });
        });
    }
  }

  openHelp() {
    this.helpClicked = !this.helpClicked;
  }

  backToList(): void {
    this._router.navigate(['/main/supplies/supplies']);
  }

  clearForm(): void {
    this.formGroup.reset();

    this._router.navigate([], {
      relativeTo: this._route,
    });

    this.buttonText = 'Guardar';
  }
}
