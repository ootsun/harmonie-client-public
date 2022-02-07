import {
  Component,
  OnInit,
} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProductService} from "@services/product.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  templateUrl: './select-year-dialog.component.html',
  styleUrls: ['./select-year-dialog.component.scss'],
})
export class SelectYearDialogComponent implements OnInit {

  NUMBER_REGEX = /^\d+$/;

  constructor(
    public dialogRef: MatDialogRef<SelectYearDialogComponent>,
    private productService: ProductService,
    private formBuilder: FormBuilder
  ) {
  }

  selectYearForm: FormGroup;
  loading: boolean;

  ngOnInit() {
    this.selectYearForm = this.formBuilder.group({
      selectedYear: [new Date().getFullYear(), [Validators.required, Validators.pattern(this.NUMBER_REGEX)]]
    });
  }

  onExport() {
    this.loading = true;
    const year = this.selectYearForm.controls.selectedYear.value;
    this.productService
      .exportLosses(year)
      .subscribe(res => {
        const tmpUrl = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = tmpUrl;
        a.download = 'Pertes - ' + year + '.xlsx';
        a.click();
        window.URL.revokeObjectURL(tmpUrl);
        a.remove();
        this.loading = false;
        this.dialogRef.close();
      }, (error) => {
        this.loading = false;
        this.dialogRef.close(error);
      });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
