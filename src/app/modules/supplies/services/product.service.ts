import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productUrl = `${environment.apiAuthUrl}/product/`;

  constructor(private http: HttpClient) {}

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.productUrl, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.productUrl}${id}`);
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
