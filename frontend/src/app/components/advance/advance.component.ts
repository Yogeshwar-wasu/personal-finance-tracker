import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../_services/api.service';


interface Payment {
  id?: number;           // optional if saved in DB
  paymentAmount: number;
  date: string;
  balance: number;
}

interface AdvanceRow {
  id?: number;
  name: string;
  amount: number;
  payments: Payment[];
  status: string;
}

@Component({
  selector: 'app-advance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advance.component.html',
  styleUrl: './advance.component.scss'
})
export class AdvanceComponent implements OnInit {

  advanceRows: AdvanceRow[] = [];
  totalAmount = 0;
  amountUsed = 0;
  balanceAmount = 0;
  transactionId: any;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {

  }

  ngOnInit(): void {
    this.loadAdvanceRows();
  }

  loadAdvanceRows() {
    this.apiService.getAdvanceRows().subscribe({
      next: (res: AdvanceRow[]) => {
        this.advanceRows = res;
        this.calculateTotals();
      },
      error: (err) => console.error('Error loading advance rows:', err)
    });
  }


  addMainRow() {
    this.advanceRows.push({ name: '', amount: 0, payments: [], status: '' });
    this.calculateTotals();
  }

  deleteMainRow(index: number) {
    const row = this.advanceRows[index];
    if (!confirm(`Are you sure you want to delete this advance?`)) {
      return;
    }
    if (row.id) {
      this.apiService.deleteAdvanceRow(row.id).subscribe({
        next: () => {
          this.advanceRows.splice(index, 1);
          this.calculateTotals();
          alert('Advance deleted successfully ✅');
        },
        error: (err) => {
          console.error('Error deleting main row:', err);
          alert('Failed to delete advance ❌');
        }
      });
    } else {
      this.advanceRows.splice(index, 1);
      this.calculateTotals();
    }
  }

  addPayment(mainIndex: number) {
    const row = this.advanceRows[mainIndex];

    let lastBalance = row.amount;
    if (row.payments.length > 0) {
      lastBalance = row.payments[row.payments.length - 1].balance;
    }

    if (lastBalance <= 0) {
      alert('No balance available ❌');
      return;
    }

    row.payments.push({
      paymentAmount: 0,
      date: '',
      balance: lastBalance
    });

    this.calculateTotals();

  }

  deletePayment(mainIndex: number, paymentIndex: number) {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }
    const payment = this.advanceRows[mainIndex].payments[paymentIndex];
    if (payment.id) {
      this.apiService.deletePayment(payment.id).subscribe({
        next: () => {
          this.advanceRows[mainIndex].payments.splice(paymentIndex, 1);
          this.calculateTotals();
          alert('Payment deleted successfully ✅');
        },
        error: (err) => {
          console.error('Error deleting payment:', err);
          alert('Failed to delete payment ❌');
        }
      });
    } else {
      this.advanceRows[mainIndex].payments.splice(paymentIndex, 1);
      this.calculateTotals();
    }
  }

  calculateTotals() {
    let total = 0;
    let used = 0;

    this.advanceRows.forEach(row => {
      const rowAmount = Number(row.amount) || 0;
      total += rowAmount;

      let runningBalance = rowAmount;

      row.payments.forEach(payment => {
        const pay = Number(payment.paymentAmount) || 0;
        used += pay;

        runningBalance -= pay;
        payment.balance = runningBalance < 0 ? 0 : runningBalance;
      });

      // auto status
      row.status = runningBalance <= 0 ? 'COMPLETED' : 'PENDING';
    });

    this.totalAmount = total;
    this.amountUsed = used;
    this.balanceAmount = total - used;
  }

  // Save all data (create/update)
  saveAdvanceRows() {
    this.apiService.saveAdvanceRows(this.advanceRows).subscribe({
      next: (res) => {
        alert('Advance details saved successfully ✅');
        console.log('Data saved successfully', res);
        this.loadAdvanceRows(); // reload after save
      },
      error: (err) => {
        alert('Failed to save advance details ❌');
        console.error(err);

      }
    });
  }

  recalculateRowBalance(mainIndex: number) {
    const row = this.advanceRows[mainIndex];

    let runningBalance = row.amount || 0;

    row.payments.forEach(payment => {
      const pay = payment.paymentAmount || 0;
      runningBalance = runningBalance - pay;
      payment.balance = runningBalance;
    });

    this.calculateTotals(); // update header totals
  }


}
