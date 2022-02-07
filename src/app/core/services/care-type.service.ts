import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {CareType} from '@models/care-type.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root',
})
export class CareTypeService {

    API_BASE_URL;
    API_PATH = '/care-types/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(careType: CareType): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, careType);
    }

    getAll(): Observable<CareType[]> {
        return this.http.get<CareType[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(careTypeId: string): Observable<CareType> {
        return this.http.get<CareType>(this.API_BASE_URL + this.API_PATH + careTypeId);
    }

    update(careType: CareType): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + careType._id, careType);
    }

    delete(careTypeId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + careTypeId);
    }
}
