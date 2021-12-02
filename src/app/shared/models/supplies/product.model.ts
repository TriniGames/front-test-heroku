export interface IProduct {
  _id: string | null;
  CreatedBy: string | null;
  CreationDate: number | null;
  Description: string | null;
  EditedBy: string | null;
  EditionDate: number | null;
  Index: number | null;
  Name: string | null;
  PartialProduct: boolean | null;
  Size: number | null;
  Stock: number | null;
  Supplies: string | null;
  TipoProducto: string | null;
  Type: string | null;
  TypeDescription: string | null;
  Unit: string | null;
}

export class Product implements IProduct {
  constructor(
    public _id: string | null = null,
    public CreatedBy: string | null = null,
    public CreationDate: number | null = null,
    public Description: string | null = null,
    public EditedBy: string | null = null,
    public EditionDate: number | null = null,
    public Index: number | null = null,
    public Name: string | null = null,
    public PartialProduct: boolean | null = null,
    public Size: number | null = null,
    public Stock: number | null = null,
    public Supplies: string | null = null,
    public TipoProducto: string | null = null,
    public Type: string | null = null,
    public TypeDescription: string | null = null,
    public Unit: string | null = null
  ) {}
}
