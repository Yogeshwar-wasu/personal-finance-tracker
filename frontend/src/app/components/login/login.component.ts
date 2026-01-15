import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- ADD THIS


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  loading = false;


  constructor(private router: Router) { }

  onLogin() {
    if (!this.username || !this.password) return;

    this.loading = true;

    // simulate API delay
    setTimeout(() => {
      if (this.username === 'admin' && this.password === '1234') {
        localStorage.setItem('token', 'logged-in');
        this.router.navigate(['/']);
      } else {
        alert('Invalid credentials');
      }
      this.loading = false;
    }, 1500);
  }

}
