import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CourseEditorComponent} from './course-editor/course-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: CourseEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: CourseEditorComponent,
        canActivate: [AuthenticationGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        AuthenticationGuard
    ]
})
export class CoursesRoutingModule {

}
