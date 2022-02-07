import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Training} from '@models/training.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root',
})
export class TrainingService {

    API_BASE_URL;
    API_PATH = '/trainings/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(training: Training): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, training);
    }

    getAll(): Observable<Training[]> {
        return this.http.get<Training[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(trainingId: string): Observable<Training> {
        return this.http.get<Training>(this.API_BASE_URL + this.API_PATH + trainingId);
    }

    update(training: Training): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + training._id, training);
    }

    delete(trainingId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + trainingId);
    }
}
