import {Component, OnDestroy, OnInit} from '@angular/core';
import {SecurityService} from '@services/security.service';
import {Subscription} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {AppConfigService} from '@services/app-config.service';

@Component({
    selector: 'home-menu',
    templateUrl: './home-menu.component.html',
    styleUrls: ['./home-menu.component.scss'],
})
export class HomeMenuComponent implements OnInit, OnDestroy {
    envName: string;
    isAuthenticated: boolean;
    currentUrl: string;
    private authListenerSubs: Subscription;

    constructor(
        private securityService: SecurityService,
        private router: Router,
        private appConfigService: AppConfigService) {
    }

    ngOnInit() {
        const envName = this.appConfigService.envName;
        if (envName && envName.toLowerCase() !== 'prod') {
            this.envName = envName.toLowerCase();
        }

        this.authListenerSubs = this.securityService.isAuthenticatedObs().subscribe(
            value => this.isAuthenticated = value
        );

        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.currentUrl = e.urlAfterRedirects;
            }
        });
        this.currentUrl = this.router.url;
    }

    onLogout() {
        this.securityService.removeToken();
        this.router.navigate(['/login']);
    }

    ngOnDestroy() {
        this.authListenerSubs.unsubscribe();
    }
}
