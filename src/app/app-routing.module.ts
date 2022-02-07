import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthenticationBasedPreloader} from '@services/authentication-based.preloader';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'login',
        canActivate: [AuthenticationGuard],
        loadChildren: 'app/components/login/login.module#LoginModule'
    },
    {
        path: '',
        loadChildren: () =>
            import('./components/home/home.module').then(
                (m) => m.HomeModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'cares',
        loadChildren: () =>
            import('./components/cares/cares.module').then(
                (m) => m.CaresModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'sales',
        loadChildren: () =>
            import('./components/sales/sales.module').then(
                (m) => m.SalesModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'patients',
        loadChildren: () =>
            import('./components/patients/patients.module').then(
                (m) => m.PatientsModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'products',
        loadChildren: () =>
            import('./components/products/products.module').then(
                (m) => m.ProductsModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'care-types',
        loadChildren: () =>
            import('./components/care-types/care-types.module').then(
                (m) => m.CareTypesModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'trainings',
        loadChildren: () =>
            import('./components/trainings/trainings.module').then(
                (m) => m.TrainingsModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: 'courses',
        loadChildren: () =>
            import('./components/courses/courses.module').then(
                (m) => m.CoursesModule,
            ),
        data: {shouldBeAuthenticated: true},
    },
    {
        path: '*',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: AuthenticationBasedPreloader})
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {
}
