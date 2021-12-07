import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  private lookupUrl = `${environment.apiAuthUrl}/lookup`;

  constructor(private http: HttpClient) {}

  lookupByName(lookupName: String): Observable<any[]> {
    const lookupUrl = `${this.lookupUrl}/${lookupName}`;

    return this.http.get<any>(lookupUrl);
  }
}
