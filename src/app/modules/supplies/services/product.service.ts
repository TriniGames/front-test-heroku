import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productUrl = `${environment.apiAuthUrl}/product/`;

  constructor(private http: HttpClient) {}

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.productUrl, product);
  }

  getProducts(): Observable<any> {
    return this.http.get<any>(this.productUrl);
  }

  getProduct(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.productUrl}byId/${id}`)
      .pipe(map((response) => response));
  }

  getPartialProducts(): Observable<any> {
    return this.http
      .get<any>(`${this.productUrl}/partial`)
      .pipe(map((response) => response));
  }

  updateProduct(product: any): Observable<any> {
    return this.http.put<any>(this.productUrl, product);
  }
}
