import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Service pour gerer les raccourcis clavier globaux depuis Electron
 */
@Injectable({
  providedIn: 'root'
})
export class ShortcutService {
  private ctrlPSubject = new Subject<void>();
  
  /**
   * Observable emis quand Ctrl+P est presse (depuis Electron)
   */
  ctrlP$ = this.ctrlPSubject.asObservable();

  constructor() {
    this.initializeShortcuts();
  }

  /**
   * Initialise les ecouteurs de raccourcis depuis Electron
   */
  private initializeShortcuts() {
    if (typeof window !== 'undefined' && (window as any).electron?.onShortcut) {
      // S'abonner aux evenements de raccourcis depuis Electron
      (window as any).electron.onShortcut('ctrl-p', () => {
        this.ctrlPSubject.next();
      });
    }
  }

  /**
   * Declenche manuellement l'evenement Ctrl+P (utile pour les tests ou fallback)
   */
  triggerCtrlP(): void {
    this.ctrlPSubject.next();
  }
}
