import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PrintService } from '../../services/print.service';
import { ElectronService } from '../../services/electron.service';
import { GanttTvComponent } from '../gantt-tv/gantt-tv.component';
import { NgxPrintModule } from 'ngx-print';

export type PageOrientation = 'portrait' | 'landscape';
export type PageSize = 'A4' | 'A3';
export type ColorMode = 'color' | 'bw';

@Component({
  selector: 'app-print-preview',
  standalone: true,
  imports: [CommonModule, GanttTvComponent, NgxPrintModule],
  templateUrl: './print-preview.component.html',
  styleUrls: ['./print-preview.component.css']
})
export class PrintPreviewComponent implements OnInit {
  private router = inject(Router);
  private printService = inject(PrintService);
  private electronService = inject(ElectronService);

  shows = this.printService.getShows();
  channels = this.printService.getChannels();

  // Options d'impression
  orientation = signal<PageOrientation>('landscape');
  pageSize = signal<PageSize>('A4');
  colorMode = signal<ColorMode>('color');
  showSettings = signal(false);
  currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor() {
    // Mettre à jour le style @page quand les paramètres changent
    effect(() => {
      this.updatePrintStyle();
    });
  }

  ngOnInit(): void {
    this.updatePrintStyle();
  }

  /**
   * Met à jour le style @page dynamiquement
   */
  private updatePrintStyle() {
    const styleId = 'dynamic-print-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const size = this.pageSize();
    const orientation = this.orientation();
    
    styleElement.textContent = `
      @media print {
        @page {
          size: ${size} ${orientation};
          margin: 1cm;
        }
      }
    `;
  }

  /**
   * Retourne la semaine actuelle formatée
   */
  getCurrentWeek(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    return `${weekNumber} - ${now.getFullYear()}`;
  }

  /**
   * Bascule l'affichage des paramètres
   */
  toggleSettings() {
    this.showSettings.set(!this.showSettings());
  }

  /**
   * Change l'orientation de la page
   */
  setOrientation(orientation: PageOrientation) {
    this.orientation.set(orientation);
  }

  /**
   * Change la taille de la page
   */
  setPageSize(size: PageSize) {
    this.pageSize.set(size);
  }

  /**
   * Change le mode de couleur
   */
  setColorMode(mode: ColorMode) {
    this.colorMode.set(mode);
  }

  /**
   * Retourne la classe CSS pour l'orientation et la taille
   */
  getPageClass(): string {
    return `page-${this.pageSize().toLowerCase()} orientation-${this.orientation()}`;
  }

  /**
   * Gère l'impression via Electron (silencieux) ou navigateur (fallback ngx-print)
   */
  async handlePrint(event?: Event) {
    if (this.electronService.isElectron()) {
      // Empêcher ngx-print de se déclencher
      event?.preventDefault();
      
      // Impression silencieuse via Electron
      const result = await this.electronService.printToPDF({
        pageSize: this.pageSize(),
        orientation: this.orientation(),
        marginsType: 1, // 1 = marges minimales
        printBackground: this.colorMode() === 'color',
        printSelectionOnly: false
      });

      if (result.success) {
        console.log('PDF enregistré:', result.filePath);
        alert(`PDF enregistré avec succès: ${result.filePath}`);
      } else {
        console.error('Erreur impression:', result.error);
        alert(`Erreur lors de l'impression: ${result.error}`);
      }
    }
    // Sinon, laisser ngx-print gérer l'impression (ne rien faire)
  }

  /**
   * Retour à la page d'édition
   */
  goBack() {
    this.printService.clearData();
    this.router.navigate(['/print']);
  }
}
