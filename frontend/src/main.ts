import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { TransactionsComponent } from './app/components/transactions/transactions.component';
import { AddComponent } from './app/components/add/add.component';
import { BalanceComponent } from './app/components/balance/balance.component';
import { AdvanceComponent } from './app/components/advance/advance.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './app/components/login/login.component';
import { authGuard } from './app/_services/auth.guard';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: '', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
      { path: 'add', component: AddComponent, canActivate: [authGuard] },
      { path: 'add/:id', component: AddComponent, canActivate: [authGuard] },
      { path: 'balance', component: BalanceComponent, canActivate: [authGuard] },
      { path: 'advance', component: AdvanceComponent, canActivate: [authGuard] },
      { path: 'balance/:id', component: BalanceComponent, canActivate: [authGuard] },
      { path: '**', redirectTo: '' }
    ]),
    importProvidersFrom(HttpClientModule)]
})
  .catch((err) => console.error(err));
