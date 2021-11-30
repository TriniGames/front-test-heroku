import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockProduct } from 'src/app/shared/models/stock/product-supply.model';
import { StockSupply } from 'src/app/shared/models/stock/stock-supply.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private stockUrl = `${environment.apiAuthUrl}/stock`;

  constructor(private http: HttpClient) {}

  addStockSupply(supply: StockSupply): Observable<any> {
    return this.http.post<any>(`${this.stockUrl}/supply`, supply);
  }

  addStockProduct(product: StockProduct): Observable<any> {
    return this.http.post<any>(`${this.stockUrl}/product`, product);
  }
}
