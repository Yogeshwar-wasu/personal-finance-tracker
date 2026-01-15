import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../_services/api.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface BalanceRow {
  id?: number;
  name: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss'
})
export class BalanceComponent implements OnInit {

  balanceRows: BalanceRow[] = [
    { name: '', amount: 0, date: '' }
  ];

  totalAmount = 0;
  balanceAmount = 0;
  amountUsed = 0;

  transactionId: any;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {

  }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.getBalance(this.transactionId);
    }
  }

  getBalance(transactionId: any) {
    this.apiService.getBalance(transactionId).subscribe(
      (res: any) => {
        this.balanceRows = (res.list || []).map((row: any) => ({
          ...row,
          amount: Number(row.amount || 0),
          date: row.date || ''
        }));

        this.totalAmount = Number(res.totalAmount || 0);
        this.calculateAmounts();
      },
      (error: any) => {
        console.error('Error fetching clients: ', error);
      }
    );
  }

  addRow() {
    this.balanceRows.push({ name: '', amount: 0, date: '' });
    this.calculateAmounts();
  }

  deleteRow(index: number) {
    const row = this.balanceRows[index];
    if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return;

    if (row.id) {
      this.apiService.deleteBalanceRow(row.id).subscribe({
        next: (res: any) => {
          alert('Row deleted successfully ✅');
          this.balanceRows.splice(index, 1);
          this.calculateAmounts();
        },
        error: (err) => {
          console.error(err);
          alert("Error deleting row");
        }
      });
    } else {
      this.balanceRows.splice(index, 1);
      this.calculateAmounts();
    }
  }

  calculateAmounts() {
    let used = 0;

    this.balanceRows.forEach(r => {
      const amt = Number(r.amount);
      used += isNaN(amt) ? 0 : amt;
    });

    this.amountUsed = used;
    this.balanceAmount = (Number(this.totalAmount) || 0) - used;
  }

  save() {
    const rowsWithTransaction = this.balanceRows.map(row => ({
      ...row,
      transactionId: this.transactionId,
      date: row.date ? row.date : null
    }));

    if (!rowsWithTransaction.length) {
      alert('No rows to save!');
      return;
    }

    this.apiService.saveBalanceRows(rowsWithTransaction).subscribe({
      next: (res) => {
        alert('Saved successfully ✅');
        this.calculateAmounts();
      },
      error: (err) => {
        console.error(err);
        alert('Error saving data');
      }
    });
  }

  exportToExcel(): void {
    if (!this.balanceRows || this.balanceRows.length === 0) {
      alert('No data available to export');
      return;
    }

    const excelData = this.balanceRows.map((item, index) => {
      return {
        'Sr. No': index + 1,
        'Name': item.name,
        'Amount': item.amount,
        'Date': this.formatDate(item.date)
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Total Amount', this.totalAmount],
      ['Amount Used', this.amountUsed],
      ['Balance Amount', this.balanceAmount]
    ], { origin: 'B2' });

    XLSX.utils.sheet_add_json(
      worksheet,
      excelData,
      {
        origin: 'A8',
        skipHeader: false
      }
    );

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expense Report': worksheet },
      SheetNames: ['Expense Report']
    };

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    this.saveExcel(buffer, 'Expense_Report');
  }


  private saveExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    saveAs(data, `${fileName}_${formattedDate}.xlsx`);
  }


  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }


}
