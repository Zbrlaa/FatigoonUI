import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, input, effect } from '@angular/core';

export interface TvShow {
  channel: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

@Component({
  selector: 'app-gantt-tv',
  standalone: true,
  templateUrl: './gantt-tv.component.html',
  styleUrls: ['./gantt-tv.component.css']
})
export class GanttTvComponent implements AfterViewInit, OnDestroy {
  shows = input<TvShow[]>([]);
  channels = input<string[]>([]);
  @ViewChild('ganttContainer', { static: false }) container!: ElementRef<HTMLDivElement>;

  private stage: any = null;
  private layer: any = null;
  private KonvaRef: any = null;
  private resizeHandler = () => this.onResize();

  async ngAfterViewInit() {
    const konvaModule = await import('konva');
    const Konva = (konvaModule && (konvaModule.default || konvaModule)) as any;
    this.KonvaRef = Konva;
    this.initStage();
    window.addEventListener('resize', this.resizeHandler);
    effect(() => {
      this.redraw();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
    }
  }

  private initStage() {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const width = Math.max(600, Math.round(rect.width));
    const height = Math.max(300, Math.round(rect.height || 400));
    this.stage = new this.KonvaRef.Stage({
      container: this.container.nativeElement,
      width,
      height,
    });
    this.layer = new this.KonvaRef.Layer();
    this.stage.add(this.layer);
    this.drawGantt(width, height);
  }

  private onResize() {
    if (!this.stage || !this.KonvaRef) return;
    const rect = this.container.nativeElement.getBoundingClientRect();
    const w = Math.max(600, Math.round(rect.width));
    const h = Math.max(300, Math.round(rect.height || 400));
    this.stage.width(w);
    this.stage.height(h);
    if (this.layer) this.layer.removeChildren();
    this.drawGantt(w, h);
  }

  private redraw() {
    if (!this.stage || !this.KonvaRef) return;
    const w = this.stage.width();
    const h = this.stage.height();
    if (this.layer) this.layer.removeChildren();
    this.drawGantt(w, h);
  }

  private drawGantt(width: number, height: number) {
    if (!this.layer) return;
    const shows = this.shows();
    const channels = this.channels();
    const paddingLeft = 120;
    const paddingTop = 40;
    const rowHeight = 70; // plus grand
    const startHour = 12;
    const endHour = 24;
    const hourCount = endHour - startHour;
    const hourWidth = (width - paddingLeft - 10) / hourCount;

    // Fond blanc
    this.layer.add(new this.KonvaRef.Rect({
      width,
      height,
      fill: '#ffffff',
    }));

    // Quadrillage vertical (heures)
    for (let h = startHour; h <= endHour; h++) {
      const x = paddingLeft + (h - startHour) * hourWidth;
      this.layer.add(new this.KonvaRef.Line({
        points: [x, paddingTop, x, paddingTop + channels.length * rowHeight],
        stroke: '#d0d0d0',
        strokeWidth: h % 6 === 0 ? 2 : 1,
      }));
      if (h < endHour) {
        this.layer.add(new this.KonvaRef.Text({
          x: x + 2,
          y: 8,
          text: `${h}h`,
          fontSize: 15,
          fill: '#000000',
        }));
      }
    }

    // Quadrillage horizontal (chaînes)
    for (let i = 0; i <= channels.length; i++) {
      const y = paddingTop + i * rowHeight;
      this.layer.add(new this.KonvaRef.Line({
        points: [paddingLeft, y, width - 10, y],
        stroke: '#d0d0d0',
        strokeWidth: 1,
      }));
      if (i < channels.length) {
        this.layer.add(new this.KonvaRef.Text({
          x: 10,
          y: y + rowHeight / 2 - 12,
          text: channels[i],
          fontSize: 18,
          fill: '#000000',
          fontStyle: 'bold',
        }));
      }
    }

    // Affichage emissions
    for (const show of shows) {
      const channelIdx = channels.indexOf(show.channel);
      if (channelIdx === -1) continue;
      if (show.end <= startHour || show.start >= endHour) continue;
      const showStart = Math.max(show.start, startHour);
      const showEnd = Math.min(show.end, endHour);
      const x = paddingLeft + (showStart - startHour) * hourWidth;
      const y = paddingTop + channelIdx * rowHeight + 10;
      const w = Math.max(12, (showEnd - showStart) * hourWidth - 6);
      this.layer.add(new this.KonvaRef.Rect({
        x, y,
        width: w,
        height: rowHeight - 20,
        fill: show.color,
        cornerRadius: 8,
        shadowColor: '#000',
        shadowBlur: 8,
        shadowOpacity: 0.13,
      }));
      this.layer.add(new this.KonvaRef.Text({
        x: x + 8,
        y: y + 10,
        text: show.name,
        fontSize: 15,
        fill: '#000000',
        width: w - 16,
        ellipsis: true,
      }));
    }
    this.layer.draw();
  }

  /**
   * Exporte le diagramme Konva en image Data URL (PNG)
   */
  exportToImage(): string {
    if (!this.stage) {
      throw new Error('Stage Konva non initialise');
    }
    return this.stage.toDataURL({ pixelRatio: 2 });
  }
}
