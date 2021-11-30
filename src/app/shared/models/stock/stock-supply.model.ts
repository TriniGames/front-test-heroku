export interface IStockSupply {
  Quantity: number | null;
  Supply: string | null;
}

export class StockSupply implements IStockSupply {
  constructor(
    public Quantity: number | null = null,
    public Supply: string | null = null
  ) {}
}
