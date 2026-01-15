import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../_services/api.service';

interface Transaction {
  id?: number;
  description: string;
  amount: number;
  usedAmount: number;
  balance: number,
  category: string;
  paymentMethod?: string;
  date: string;
  notes?: string;
  status?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {

  constructor(private router: Router, private apiService: ApiService) { }

  transactions: Transaction[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.getTransaction();
  }

  getTransaction() {
    this.apiService.getTransaction().subscribe(
      (res: any) => {
        this.transactions = res;
      },
      (error: any) => {
        console.error('Error fetching clients: ', error);
      }
    );
  }

  addDetails(data: any) {
    this.router.navigate(['/balance', data.id]);
  }

  editRow(index: any) {
    this.router.navigate(['/add', index.id]);
  }

  deleteRow(index: number) {
    const row = this.transactions[index];

    const confirmed = confirm(`Are you sure you want to delete "${row.description}"?`);
    if (!confirmed) return;

    if (row.id) {
      this.apiService.deleteTransactionRow(row.id).subscribe({
        next: (res: any) => {
          alert('Row deleted successfully!');
          this.transactions.splice(index, 1);
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting row');
        }
      });
    } else {
      this.transactions.splice(index, 1);
    }
  }

sortData(column: keyof Transaction | 'sr') {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.transactions.sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if (column === 'sr') {
      valueA = this.transactions.indexOf(a) + 1;
      valueB = this.transactions.indexOf(b) + 1;
    } else if (column === 'date') {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    } else if (column === 'description') {
      // Try to extract date from description (pattern dd/MM/yyyy)
      const dateRegex = /(\d{2}\/\d{2}\/\d{4})$/;

      const matchA = a.description.match(dateRegex);
      const matchB = b.description.match(dateRegex);

      if (matchA && matchB) {
        valueA = new Date(matchA[1].split('/').reverse().join('-')).getTime();
        valueB = new Date(matchB[1].split('/').reverse().join('-')).getTime();
      } else {
        valueA = a.description.toLowerCase();
        valueB = b.description.toLowerCase();
      }
    } else {
      valueA = a[column];
      valueB = b[column];

      // Numeric columns
      if (['amount', 'usedAmount', 'balance'].includes(column)) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }

      // String columns
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
    }

    if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}



}
