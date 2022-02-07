import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Course} from '@models/course.model';
import {AppConfigService} from '@services/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    API_BASE_URL;
    API_PATH = '/courses/';

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService) {
        this.API_BASE_URL = this.appConfigService.apiBaseUrl;
    }

    create(course: Course): Observable<any> {
        return this.http.post<any>(this.API_BASE_URL + this.API_PATH, course);
    }

    getAll(): Observable<Course[]> {
        return this.http.get<Course[]>(this.API_BASE_URL + this.API_PATH);
    }

    get(courseId: string): Observable<Course> {
        return this.http.get<Course>(this.API_BASE_URL + this.API_PATH + courseId);
    }

    update(course: Course): Observable<any> {
        return this.http.put<any>(this.API_BASE_URL + this.API_PATH + course._id, course);
    }

    delete(courseId: string): Observable<any> {
        return this.http.delete<any>(this.API_BASE_URL + this.API_PATH + courseId);
    }
}
