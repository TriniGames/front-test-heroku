export interface ISupply {
  _id: string | null;
  CreatedBy: string | null;
  CreationDate: number | null;
  Description: string | null;
  EditedBy: string | null;
  EditionDate: number | null;
  Index: number | null;
  Name: string | null;
  Stock: number | null;
  Type: string | null;
  TypeDescription: string | null;
}

export class Supply implements ISupply {
  constructor(
    public _id: string | null = null,
    public CreatedBy: string | null = null,
    public CreationDate: number | null = null,
    public Description: string | null = null,
    public EditedBy: string | null = null,
    public EditionDate: number | null = null,
    public Index: number | null = null,
    public Name: string | null = null,
    public Stock: number | null = null,
    public Type: string | null = null,
    public TypeDescription: string | null = null
  ) {}
}
