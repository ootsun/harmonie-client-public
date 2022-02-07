import {Sale} from '@models/sale.model';
import {Care} from '@models/care.model';
import {Course} from '@models/course.model';

export class Vat {

    constructor(public cares: Array<Care>,
                public sales: Array<Sale>,
                public courses: Array<Course>) {
    }
}
