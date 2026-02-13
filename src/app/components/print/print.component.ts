import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GanttTvComponent, TvShow } from '../gantt-tv/gantt-tv.component';
import { PrintService } from '../../services/print.service';

@Component({
  selector: 'app-print',
  standalone: true,
  imports: [CommonModule, GanttTvComponent],
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent {
  @ViewChild(GanttTvComponent) ganttComponent!: GanttTvComponent;

  private router = inject(Router);
  private printService = inject(PrintService);

  channels = signal<string[]>(['TF1', 'France 2', 'Arte', 'M6']);
  shows = signal<TvShow[]>([
    { channel: 'TF1', name: 'Journal', start: 16, end: 18, color: '#e74c3c' },
    { channel: 'TF1', name: 'Film', start: 20.5, end: 23.5, color: '#e74c3c' },
    { channel: 'France 2', name: 'Info', start: 18, end: 21, color: '#2980b9' },
    { channel: 'Arte', name: 'Documentaire', start: 13.5, end: 17, color: '#27ae60' },
    { channel: 'M6', name: 'Reportage', start: 20, end: 23, color: '#8e44ad' },
  ]);

  /**
   * Prépare l'impression : passe les données du Gantt au service et navigue vers la page d'impression
   */
  prepareForPrint() {
    // Passe les données du diagramme au service
    this.printService.setGanttData(this.shows(), this.channels());
    
    // Navigue vers la page de preview
    this.router.navigate(['/print-preview']);
  }
}

