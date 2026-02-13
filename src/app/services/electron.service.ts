import { Injectable } from '@angular/core';

/**
 * Interface pour l'API Electron exposée via preload.js
 */
interface ElectronAPI {
  printToPDF: (options: PrintOptions) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

/**
 * Options d'impression pour Electron
 */
export interface PrintOptions {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginsType: 0 | 1 | 2; // 0: default, 1: none, 2: minimal
  printBackground: boolean;
  printSelectionOnly: boolean;
}

/**
 * Déclare l'API Electron dans window
 */
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

/**
 * Service Angular pour communiquer avec Electron via IPC
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  /**
   * Vérifie si l'application tourne dans Electron
   */
  isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electron;
  }

  /**
   * Envoie une requête d'impression silencieuse à Electron
   * @param options Options d'impression (taille, orientation, etc.)
   * @returns Promise avec le résultat de l'impression
   */
  async printToPDF(options: PrintOptions): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!this.isElectron()) {
      console.warn('printToPDF appelé hors d\'Electron - impression normale utilisée');
      return { success: false, error: 'Not running in Electron' };
    }

    try {
      const result = await window.electron!.printToPDF(options);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'impression via Electron:', error);
      return { success: false, error: String(error) };
    }
  }
}
