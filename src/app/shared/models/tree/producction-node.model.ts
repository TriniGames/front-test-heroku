export interface ProductionNode {
  name: string;
  children?: ProductionNode[];
  node?: any;
  ids?: string[];
  idProduct?: string;
  index?: number;
  stock?: number;
  quantityToProduce?: number;
}
