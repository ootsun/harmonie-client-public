import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PatientListComponent} from './patient-list/patient-list.component';
import {ProductListComponent} from './product-list/product-list.component';
import {CareTypeListComponent} from './care-type-list/care-type-list.component';
import {CareListComponent} from './care-list/care-list.component';
import {SaleListComponent} from './sale-list/sale-list.component';
import {AuthenticationGuard} from '@services/authentication.gard';
import {VatListComponent} from './vat-list/vat-list.component';
import {TrainingListComponent} from './training-list/training-list.component';
import {CourseListComponent} from './course-list/course-list.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'cares',
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'patients',
                component: PatientListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'products',
                component: ProductListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'care-types',
                component: CareTypeListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'cares',
                component: CareListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'sales',
                component: SaleListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'vat',
                component: VatListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'trainings',
                component: TrainingListComponent,
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'courses',
                component: CourseListComponent,
                canActivate: [AuthenticationGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        AuthenticationGuard
    ]
})
export class HomeRoutingModule {

}
