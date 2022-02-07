import {Loss} from '@models/loss.model';

export class Product {

  constructor(public _id: string,
              public title: string,
              public brand: string,
              public price: number,
              public vatAmount: number,
              public stock: number,
              public losses: Loss[]) {
  }
}

export function displayProductFn(product: Product): string {
  return product ? product.title : '';
}
