import { Injectable } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { defer, NEVER } from 'rxjs';
import { finalize, share } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    overlayRef: OverlayRef | undefined;

    constructor(private overlay: Overlay) { }

    readonly spinner$ = defer(() => {
        this.show();
        return NEVER.pipe(
            finalize(() => {
                this.hide();
            })
        );
    }).pipe(share());

    show(): void {
        Promise.resolve(null).then(() => {
            this.overlayRef = this.overlay.create({
                positionStrategy: this.overlay
                    .position()
                    .global()
                    .centerHorizontally()
                    .centerVertically(),
                hasBackdrop: true,
            });
            this.overlayRef.attach(new ComponentPortal(SpinnerComponent));
        });
    }

    hide(): void {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef = undefined;
        }
    }
}
