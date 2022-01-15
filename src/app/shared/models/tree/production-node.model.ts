export interface ProductionNode {
  name: string;
  children?: ProductionNode[];
  node?: any;
  ids?: any[];
  idProduct?: string;
  index?: number;
  stock?: number;
  quantityToProduce?: number;
  stockDetail?: string;
}
