import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './home.component.html'
})
export class HomeComponent {
	username = '';
	constructor(private router: Router) {}

	search() {
		if (this.username.trim()) {
			this.router.navigate(['/user', this.username.trim()]);
		}
	}
}