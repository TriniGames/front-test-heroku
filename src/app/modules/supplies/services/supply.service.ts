import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupplyService {
  private supplyUrl = `${environment.apiAuthUrl}/supply/`;

  constructor(private http: HttpClient) {}

  createSupply(supply: any): Observable<any> {
    return this.http.post<any>(this.supplyUrl, supply);
  }

  getSupplies(): Observable<any> {
    return this.http.get<any>(this.supplyUrl).pipe(map((response) => response));
  }

  getSupply(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.supplyUrl}/${id}`)
      .pipe(map((response) => response));
  }

  updateSupply(supply: any): Observable<any> {
    return this.http.put<any>(this.supplyUrl, supply);
  }
}
