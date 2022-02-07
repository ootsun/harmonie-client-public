import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Sale} from '../models/sale.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class SaleService {

    API_BASE_URL;
    API_PATH = '/sales/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(sale: Sale): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, sale);
    }

    getAll(): Observable<Sale[]> {
        return this.http.get<Sale[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(saleId: string): Observable<Sale> {
        return this.http.get<Sale>(this.API_BASE_URL + this.API_PATH + saleId);
    }

    update(sale: Sale): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + sale._id, sale);
    }

    delete(saleId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + saleId);
    }
}
