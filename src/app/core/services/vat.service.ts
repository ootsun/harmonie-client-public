import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {AppConfigService} from '@services/app-config.service';
import {Vat} from '@models/vat.model';
import {Quarter} from '@models/quarter.model';

@Injectable({
    providedIn: 'root',
})
export class VatService {

    API_BASE_URL;
    API_PATH = '/vat/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    getVat(): Observable<Vat> {
        return this.http.get<Vat>(this.API_BASE_URL + this.API_PATH);
    }

    export(quarter: Quarter): Observable<any> {
        return this.http.post(this.API_BASE_URL + this.API_PATH + 'export', quarter, {responseType: 'blob'});
    }
}
