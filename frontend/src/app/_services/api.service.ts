import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getTransaction(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transactions/all`);
  }

  AddTransaction(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/add`, data);
  }

  saveBalanceRows(rows: any[]) {
    return this.http.post(`${this.baseUrl}/balance/save`, { rows });
  }

  getBalance(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/balance/all/${id}`);
  }

  deleteBalanceRow(rowId: number) {
    return this.http.delete(`${this.baseUrl}/balance/delete/${rowId}`);
  }

  deleteTransactionRow(rowId: number) {
    return this.http.delete(`${this.baseUrl}/transactions/delete/${rowId}`);
  }

  getDetails(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transactions/${id}`);
  }

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/summary`);
  }

  getRecentTransactions() {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/recent-transactions`);
  }

  getAdvanceRows(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/advance/all`);
  }

  // Save balance rows (create/update)
  saveAdvanceRows(rows: any[]) {
    return this.http.post(`${this.baseUrl}/advance/save`, {rows});
  }

  // Delete a main balance row
  deleteAdvanceRow(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/advance/delete-row/${id}`);
  }

  // Delete a payment
  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/advance/delete-payment/${id}`);
  }

}