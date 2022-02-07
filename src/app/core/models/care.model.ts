import {Patient} from './patient.model';
import {CareType} from './care-type.model';

export class Care {

    constructor(public _id: string,
                public date: Date,
                public patient: Patient,
                public type: CareType,
                public toPay: number,
                public paid: number,
                public paymentMethods: string,
                public note: string) {
    }
}
