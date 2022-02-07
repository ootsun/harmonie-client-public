import {Patient} from './patient.model';
import {SaleLine} from './sale-line.model';

export class Sale {

    constructor(public _id: string,
                public patient: Patient,
                public saleLines: Array<SaleLine>,
                public date: Date,
                public paymentMethods: string[]) {
    }

    static computeTotalToPay(sale: Sale): number {
        if (!sale) {
            return 0;
        }
        return sale.saleLines
            .map(sl => sl.toPay)
            .reduce((acc, value) => acc + value, 0);
    }

    static computeTotalToPayFormatted(sale: Sale): string {
        return new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(sale ? this.computeTotalToPay(sale) : 0);
    }
}
