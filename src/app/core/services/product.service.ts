import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Product} from '../models/product.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    API_BASE_URL;
    API_PATH = '/products/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(product: Product): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, product);
    }

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(productId: string): Observable<Product> {
        return this.http.get<Product>(this.API_BASE_URL + this.API_PATH + productId);
    }

    update(product: Product): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + product._id, product);
    }

    delete(productId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + productId);
    }

    exportLosses(year: number): Observable<any> {
        return this.http.get(this.API_BASE_URL + this.API_PATH + 'export-losses/' + year, {responseType: 'blob'});
    }
}
