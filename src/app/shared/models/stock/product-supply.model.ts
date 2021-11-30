export interface IStockProduct {
  Quantity: number | null;
  Product: string | null;
}

export class StockProduct implements IStockProduct {
  constructor(
    public Quantity: number | null = null,
    public Product: string | null = null
  ) {}
}
