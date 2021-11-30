export class GetSupplies {
  static readonly type = '[AUTHENTICATE] Get Supplies';
  constructor() {}
}

export class GetSupply {
  static readonly type = '[AUTHENTICATE] Get Supply';
  constructor(public Id: string) {}
}

export class GetProduct {
  static readonly type = '[AUTHENTICATE] Get Product';
  constructor(public Id: string) {}
}

export class GetPartialProducts {
  static readonly type = '[AUTHENTICATE] Get Partial Products ';
  constructor() {}
}
