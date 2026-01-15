import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  recentTransactions: any[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
    this.apiService.getSummary().subscribe(res => {
      this.totalIncome = res.totalAmount || 0;
      this.totalExpense = res.totalExpense || 0;
      this.balance = res.balance || 0;
    });

    this.apiService.getRecentTransactions().subscribe(res => {
      this.recentTransactions = res;
    });
  }

}
