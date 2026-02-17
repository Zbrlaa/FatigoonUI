import { Injectable } from '@angular/core';

/**
 * Interface pour une imprimante
 */
export interface Printer {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
}

/**
 * Interface pour l'API Electron exposee via preload.js
 */
interface ElectronAPI {
  printToPDF: (options: PrintOptions) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  printSilent: (options: PrintOptions) => Promise<{ success: boolean; error?: string }>;
  getPrinters: () => Promise<Printer[]>;
  onShortcut: (shortcut: string, callback: () => void) => () => void;
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
  printerName?: string; // Nom de l'imprimante cible
}

/**
 * Declare l'API Electron dans window
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
   * Verifie si l'application tourne dans Electron
   */
  isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electron;
  }

  /**
   * Envoie une requete d'impression silencieuse à Electron
   * @param options Options d'impression (taille, orientation, etc.)
   * @returns Promise avec le resultat de l'impression
   */
  async printToPDF(options: PrintOptions): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!this.isElectron()) {
      console.warn('printToPDF appele hors d\'Electron - impression normale utilisee');
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

  /**
   * Envoie une requete d'impression silencieuse directe (vers imprimante)
   * @param options Options d'impression (taille, orientation, etc.)
   * @returns Promise avec le resultat de l'impression
   */
  async printSilent(options: PrintOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.isElectron()) {
      console.warn('printSilent appele hors d\'Electron');
      return { success: false, error: 'Not running in Electron' };
    }

    try {
      const result = await window.electron!.printSilent(options);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'impression silencieuse:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Recupere la liste des imprimantes disponibles
   * @returns Promise avec la liste des imprimantes
   */
  async getPrinters(): Promise<Printer[]> {
    if (!this.isElectron()) {
      console.warn('getPrinters appele hors d\'Electron');
      return [];
    }

    try {
      const printers = await window.electron!.getPrinters();
      return printers;
    } catch (error) {
      console.error('Erreur lors de la recuperation des imprimantes:', error);
      return [];
    }
  }

  /**
   * S'abonne à un evenement de raccourci clavier
   * @param shortcut Nom du raccourci (ex: 'ctrl-p')
   * @param callback Fonction appelee quand le raccourci est declenche
   * @returns Fonction pour se desabonner
   */
  onShortcut(shortcut: string, callback: () => void): () => void {
    if (!this.isElectron()) {
      console.warn(`onShortcut('${shortcut}') appele hors d'Electron`);
      return () => {};
    }

    try {
      return window.electron!.onShortcut(shortcut, callback);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement du raccourci '${shortcut}':`, error);
      return () => {};
    }
  }
}
