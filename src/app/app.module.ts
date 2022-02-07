import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {SharedModule} from './shared/shared.module';
import {PatientService} from './core/services/patient.service';
import {DialogService} from './shared/components/generic-dialog/dialog.service';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {ProductService} from './core/services/product.service';
import {CareTypeService} from './core/services/care-type.service';
import {CareService} from './core/services/care.service';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

registerLocaleData(localeFr, 'fr-BE', localeFrExtra);
import {DatePipe} from '@angular/common';
import {HelperService} from '@services/helper.service';
import {AuthenticationService} from '@services/authentication.service';
import {SecurityService} from '@services/security.service';
import {LocalStorageService} from '@services/local-storage.service';
import {VatService} from './core/services/vat.service';
import {NavigationService} from '@services/navigation.service';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {PaginatorIntl} from '@services/paginator.intl';
import {TrainingService} from '@services/training.service';
import {CourseService} from '@services/course.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
    ],
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'fr-BE'},
        PatientService,
        ProductService,
        CareTypeService,
        CareService,
        DialogService,
        DatePipe,
        HelperService,
        AuthenticationService,
        SecurityService,
        LocalStorageService,
        VatService,
        NavigationService,
        TrainingService,
        CourseService,
        {provide: MatPaginatorIntl, useClass: PaginatorIntl}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
