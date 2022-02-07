import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Patient} from '../models/patient.model';
import {Observable} from 'rxjs/internal/Observable';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root',
})
export class PatientService {

    API_BASE_URL;
    API_PATH = '/patients/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(patient: Patient): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, patient);
    }

    getAll(): Observable<Patient[]> {
        return this.http.get<Patient[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(patientId: string): Observable<Patient> {
        return this.http.get<Patient>(this.API_BASE_URL + this.API_PATH + patientId);
    }

    update(patient: Patient): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + patient._id, patient);
    }

    delete(patientId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + patientId);
    }

}
