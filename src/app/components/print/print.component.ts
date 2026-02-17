import { Component, viewChild, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GanttTvComponent, TvShow } from '../gantt-tv/gantt-tv.component';
import { PrintService } from '../../services/print.service';
import { ShortcutService } from '../../services/shortcut.service';

@Component({
  selector: 'app-print',
  standalone: true,
  imports: [CommonModule, GanttTvComponent],
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit, OnDestroy {
  ganttComponent = viewChild.required<GanttTvComponent>(GanttTvComponent);

  private router = inject(Router);
  private printService = inject(PrintService);
  private shortcutService = inject(ShortcutService);
  private destroy$ = new Subject<void>();

  channels = signal<string[]>(['TF1', 'France 2', 'Arte', 'M6']);
  shows = signal<TvShow[]>([
    { channel: 'TF1', name: 'Journal', start: 16, end: 18, color: '#e74c3c' },
    { channel: 'TF1', name: 'Film', start: 20.5, end: 23.5, color: '#e74c3c' },
    { channel: 'France 2', name: 'Info', start: 18, end: 21, color: '#2980b9' },
    { channel: 'Arte', name: 'Documentaire', start: 13.5, end: 17, color: '#27ae60' },
    { channel: 'M6', name: 'Reportage', start: 20, end: 23, color: '#8e44ad' },
  ]);

  ngOnInit(): void {
    // S'abonner au raccourci Ctrl+P
    this.shortcutService.ctrlP$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.prepareForPrint();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Prepare l'impression : convertit le Konva en image et navigue vers la page d'impression
   */
  prepareForPrint() {
    if (!this.ganttComponent()) {
      console.error('Composant Gantt non disponible');
      return;
    }

    // Exporte le diagramme Konva en image Data URL
    const imageDataUrl = this.ganttComponent().exportToImage();
    
    // Passe l'image au service d'impression
    this.printService.setGanttImage(imageDataUrl);
    
    // Navigue vers la page de preview
    this.router.navigate(['/print-preview']);
  }
}

