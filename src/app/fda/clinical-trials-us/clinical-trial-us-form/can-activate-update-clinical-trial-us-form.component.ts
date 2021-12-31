import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationExtras, UrlTree } from '@angular/router';
import { AuthService } from '@gsrs-core/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class CanActivateUpdateClinicalTrialUSFormComponent implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | (boolean | UrlTree) {
        return new Observable(observer => {
            this.authService.getAuth().pipe(take(1)).subscribe(auth => {
                if (auth) {
                    this.authService.hasAnyRolesAsync('Updater', 'SuperUpdater').pipe(take(1)).subscribe(response => {
                        if (response) {
                            observer.next(true);
                            observer.complete();
                        } else {
                            observer.next(this.router.parseUrl('/browse-clinical-trials-us'));
                            observer.complete();
                        }
                    });
                } else {
                    const navigationExtras: NavigationExtras = {
                        queryParams: {
                            path: state.url
                        }
                    };
                    observer.next(this.router.createUrlTree(['/login'], navigationExtras));
                    observer.complete();
                }
            });
        });
    }
}
