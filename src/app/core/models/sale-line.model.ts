import {Product} from './product.model';

export class SaleLine {

    constructor(public _id: string,
                public product: Product,
                public quantity: number,
                public toPay: number,
                public paid: number) {
    }
}
