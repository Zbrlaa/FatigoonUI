import { Component, inject, signal, OnInit, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrintService } from '../../services/print.service';
import { ElectronService, Printer } from '../../services/electron.service';
import { ShortcutService } from '../../services/shortcut.service';

export type PageOrientation = 'portrait' | 'landscape';
export type PageSize = 'A4' | 'A3';
export type ColorMode = 'color' | 'bw';

@Component({
  selector: 'app-print-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-preview.component.html',
  styleUrls: ['./print-preview.component.css']
})
export class PrintPreviewComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private printService = inject(PrintService);
  private electronService = inject(ElectronService);
  private shortcutService = inject(ShortcutService);
  private destroy$ = new Subject<void>();

  ganttImage = signal<string | null>(null);
  printers = signal<Printer[]>([]);
  selectedPrinter = signal<string | null>(null);

  // Options d'impression
  orientation = signal<PageOrientation>('landscape');
  pageSize = signal<PageSize>('A4');
  colorMode = signal<ColorMode>('color');
  showBorder = signal<boolean>(true);
  showSettings = signal(false);
  currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor() {
    // Mettre à jour le style @page quand les parametres changent
    effect(() => {
      this.updatePrintStyle();
    });
  }

  ngOnInit(): void {
    // Charger l'image depuis le service
    const image = this.printService.getGanttImage();
    if (!image) {
      console.error('Aucune image disponible pour l\'impression');
      this.router.navigate(['/print']);
      return;
    }
    this.ganttImage.set(image);
    this.updatePrintStyle();
    

    // S'abonner au raccourci Ctrl+P
    this.shortcutService.ctrlP$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.handleSavePDF();
      });
    // Charger les imprimantes disponibles
    this.loadPrinters();
  }

  /**
   * Charge la liste des imprimantes disponibles
   */
  async loadPrinters() {
    if (!this.electronService.isElectron()) {
      return;
    }
    
    const printers = await this.electronService.getPrinters();
    this.printers.set(printers);
    
    // Selectionner l'imprimante par defaut
    const defaultPrinter = printers.find(p => p.isDefault);
    if (defaultPrinter) {
      this.selectedPrinter.set(defaultPrinter.name);
    } else if (printers.length > 0) {
      this.selectedPrinter.set(printers[0].name);
    }
  }

  ngOnDestroy(): void {
    this.printService.clearData();
    this.destroy$.next();
    this.destroy$.complete();
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
          margin: 1cm 1cm 1.5cm 1cm;
        }
      }
    `;
  }

  /**
   * Retourne la semaine actuelle formatee
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
   * Bascule l'affichage des parametres
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
   * Bascule l'affichage de la bordure
   */
  toggleBorder() {
    this.showBorder.set(!this.showBorder());
  }

  /**
   * Retourne la classe CSS pour l'orientation et la taille
   */
  getPageClass(): string {
    return `page-${this.pageSize().toLowerCase()} orientation-${this.orientation()}`;
  }

  /**
   * Gere l'impression via Electron uniquement
   */
  async handlePrint() {
    if (!this.electronService.isElectron()) {
      alert('L\'impression n\'est disponible que dans l\'application Electron');
      return;
    }

    if (!this.selectedPrinter()) {
      alert('Veuillez selectionner une imprimante');
      return;
    }

    // Masquer les boutons de parametres avant l'impression
    const toolbar = document.querySelector('.toolbar-no-print');
    const settingsPanel = document.querySelector('.settings-no-print');
    
    if (toolbar) (toolbar as HTMLElement).style.display = 'none';
    if (settingsPanel) (settingsPanel as HTMLElement).style.display = 'none';

    // Attendre que le DOM soit mis à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    // Lancer l'impression silencieuse via Electron
    const result = await this.electronService.printSilent({
      pageSize: this.pageSize(),
      orientation: this.orientation(),
      marginsType: 0,
      printBackground: this.colorMode() === 'color',
      printSelectionOnly: false,
      printerName: this.selectedPrinter()!
    });

    // Reafficher les boutons
    if (toolbar) (toolbar as HTMLElement).style.display = '';
    if (settingsPanel) (settingsPanel as HTMLElement).style.display = '';

    if (result.success) {
      console.log('Impression reussie');
      alert('Impression lancee avec succes !');
    } else {
      console.error('Erreur impression:', result.error);
      alert(`Erreur lors de l'impression: ${result.error}`);
    }
  }

  /**
   * Enregistre le document en PDF
   */
  async handleSavePDF() {
    if (!this.electronService.isElectron()) {
      alert('L\'enregistrement PDF n\'est disponible que dans l\'application Electron');
      return;
    }

    // Masquer les boutons de parametres avant l'impression
    const toolbar = document.querySelector('.toolbar-no-print');
    const settingsPanel = document.querySelector('.settings-no-print');
    
    if (toolbar) (toolbar as HTMLElement).style.display = 'none';
    if (settingsPanel) (settingsPanel as HTMLElement).style.display = 'none';

    // Attendre que le DOM soit mis à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    // Enregistrer en PDF via Electron
    const result = await this.electronService.printToPDF({
      pageSize: this.pageSize(),
      orientation: this.orientation(),
      marginsType: 0,
      printBackground: this.colorMode() === 'color',
      printSelectionOnly: false
    });

    // Reafficher les boutons
    if (toolbar) (toolbar as HTMLElement).style.display = '';
    if (settingsPanel) (settingsPanel as HTMLElement).style.display = '';

    if (result.success && result.filePath) {
      console.log('PDF enregistre:', result.filePath);
      alert(`PDF enregistre avec succes: ${result.filePath}`);
    } else {
      console.error('Erreur enregistrement PDF:', result.error);
      alert(`Erreur lors de l'enregistrement: ${result.error}`);
    }
  }

  /**
   * Retour à la page d'edition
   */
  goBack() {
    this.printService.clearData();
    this.router.navigate(['/print']);
  }
}
