import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {HomeComponent} from './home/home.component';
import {PatientListComponent} from './patient-list/patient-list.component';
import {HomeRoutingModule} from './home-routes.module';
import {ProductListComponent} from './product-list/product-list.component';
import {CareTypeListComponent} from './care-type-list/care-type-list.component';
import {CareListComponent} from './care-list/care-list.component';
import {SaleListComponent} from './sale-list/sale-list.component';
import {VatListComponent} from './vat-list/vat-list.component';
import {SelectQuarterDialogComponent} from './vat-list/select-quarter-dialog/select-quarter-dialog.component';
import {GenericDialogComponent} from '../../shared/components/generic-dialog/generic-dialog.component';
import {SelectYearDialogComponent} from './product-list/select-year-dialog/select-year-dialog.component';
import {TrainingListComponent} from './training-list/training-list.component';
import {CourseListComponent} from './course-list/course-list.component';

@NgModule({
  imports: [
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    PatientListComponent,
    ProductListComponent,
    CareTypeListComponent,
    CareListComponent,
    SaleListComponent,
    VatListComponent,
    SelectQuarterDialogComponent,
    SelectYearDialogComponent,
    TrainingListComponent,
    CourseListComponent
  ],
  entryComponents: [GenericDialogComponent]
})
export class HomeModule {
}
