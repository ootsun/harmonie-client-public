import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CourseEditorComponent} from './course-editor/course-editor.component';
import {CoursesRoutingModule} from './courses-routes.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    CourseEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CoursesRoutingModule
  ]
})
export class CoursesModule { }
