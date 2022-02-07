import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TrainingEditorComponent} from './training-editor/training-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: TrainingEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: TrainingEditorComponent,
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
export class TrainingsRoutingModule {

}
