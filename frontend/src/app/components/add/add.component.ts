import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../_services/api.service'
import { catchError, throwError } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';


interface Transaction {
  id?: number;
  description: string;
  amount: number;
  balance: number;
  category: string;
  paymentMethod?: string;
  date: string;
  notes?: string;
  status?: string;
}

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute,) { }

  Id: any;

  transaction: Transaction = {
    id: 0,
    description: '',
    amount: 0,
    balance: 0,
    category: '',
    paymentMethod: '',
    date: '',
    notes: '',
    status: 'NOT_USED'
  };

  ngOnInit(): void {
    this.Id = this.route.snapshot.paramMap.get('id'); 
    console.log("Received SR:", this.Id);
    if (this.Id) {
      this.getDetails(this.Id);
    }
  }

  getDetails(Id: any) {
    this.apiService.getDetails(Id).subscribe(
      (res: any) => {
        this.transaction = {
          id: res.id,
          description: res.description || '',
          amount: Number(res.amount) || 0,
          balance: Number(res.balance) || 0,
          category: res.category || '',
          paymentMethod: res.paymentMethod || '',
          date: res.date ? res.date.split('T')[0] : '',
          notes: res.notes || '',
          status: res.status && res.status.trim() !== ''
            ? res.status
            : 'NOT_USED'   
        };
      },
      (error: any) => {
        console.error('Error fetching transaction: ', error);
      }
    );
  }

save(form: any) {
   if (form.invalid) {
    return; // ❌ stop API call
  }
    if (!this.transaction.status) {
      this.transaction.status = 'NOT_USED';
    }

    console.log(this.transaction);
    

    this.apiService.AddTransaction(this.transaction).subscribe({
    next: () => {
      alert(this.transaction.id ? 'Updated' : 'Saved');
      this.router.navigate(['/transactions']);
    },
    error: (err) => {
      console.error(err);
      alert(
        err?.error?.message ||
        err?.error?.error ||
        'Something went wrong while saving the transaction'
      );
    }
  });
  }

}
