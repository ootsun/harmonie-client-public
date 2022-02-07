import {
    Component,
    OnInit,
} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Quarter} from '@models/quarter.model';
import {AppConfigService} from '@services/app-config.service';
import {VatService} from '@services/vat.service';

@Component({
    templateUrl: './select-quarter-dialog.component.html',
    styleUrls: ['./select-quarter-dialog.component.scss'],
})
export class SelectQuarterDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<SelectQuarterDialogComponent>,
        private router: Router,
        private appConfigService: AppConfigService,
        private vatService: VatService
    ) {
    }

    selectedQuarter: Quarter;
    quarters: Quarter[] = [];
    loading: boolean;

    ngOnInit() {
        const currentDate = new Date();
        const beginDate = new Date();
        beginDate.setFullYear(this.appConfigService.firstQuarterYear);
        beginDate.setMonth((this.appConfigService.firstQuarterNumber - 1) * 3);

        do {
            const quarterNumber = beginDate.getMonth() / 3 + 1;
            this.quarters.push(new Quarter(quarterNumber, beginDate.getFullYear()));
            beginDate.setMonth(beginDate.getMonth() + 3);
        } while (beginDate < currentDate);

        this.selectedQuarter = this.quarters[this.quarters.length - 1];
    }

    onExport() {
        this.loading = true;
        this.vatService
            .export(this.selectedQuarter)
            .subscribe(res => {
                const tmpUrl = window.URL.createObjectURL(res);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = tmpUrl;
                a.download = 'TVA - T' + this.selectedQuarter.number + ' ' + this.selectedQuarter.year + '.xlsx';
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
