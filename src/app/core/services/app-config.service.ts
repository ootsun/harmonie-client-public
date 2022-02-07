import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {

    constructor() {
    }

    get apiBaseUrl(): string {
        if (environment.apiBaseUrl && environment.apiBaseUrl.endsWith('/')) {
            return environment.apiBaseUrl.slice(0, environment.apiBaseUrl.length - 1);
        }
        return environment.apiBaseUrl;
    }

    get envName(): string {
        return environment.envName;
    }

    get defaultLoginEmail(): string {
        return environment.defaultLoginEmail;
    }

    get firstQuarterNumber(): number {
        return environment.firstQuarterNumber;
    }

    get firstQuarterYear(): number {
        return environment.firstQuarterYear;
    }

    get paymentMethodPropositions(): string[] {
        return environment.paymentMethodPropositions;
    }
}
