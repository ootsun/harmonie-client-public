import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Care} from '@models/care.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class CareService {

    API_BASE_URL;
    API_PATH = '/cares/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(care: Care): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, care);
    }

    getAll(): Observable<Care[]> {
        return this.http.get<Care[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(careId: string): Observable<Care> {
        return this.http.get<Care>(this.API_BASE_URL + this.API_PATH + careId);
    }

    update(care: Care): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + care._id, care);
    }

    delete(careId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + careId);
    }
}
