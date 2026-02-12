import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-print',
  standalone: true,
  templateUrl: './print.component.html',
})
export class PrintComponent implements AfterViewInit, OnDestroy {
  @ViewChild('konvaContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

  private stage: any = null;
  private layer: any = null;
  private KonvaRef: any = null;
  private resizeHandler = () => this.onResize();

  print() {
    window.print();
  }

  async ngAfterViewInit() {
    const konvaModule = await import('konva');
    const Konva = (konvaModule && (konvaModule.default || konvaModule)) as any;
    this.KonvaRef = Konva;

    const rect = this.container.nativeElement.getBoundingClientRect();
    const width = Math.max(300, Math.round(rect.width));
    const height = Math.max(200, Math.round(rect.height || 320));

    this.stage = new Konva.Stage({
      container: this.container.nativeElement,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.drawGantt(Konva, width, height);

    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
    }
  }

  private onResize() {
    if (!this.stage || !this.KonvaRef) return;
    const rect = this.container.nativeElement.getBoundingClientRect();
    const w = Math.max(300, Math.round(rect.width));
    const h = Math.max(200, Math.round(rect.height || 320));
    this.stage.width(w);
    this.stage.height(h);
    if (this.layer) this.layer.removeChildren();
    this.drawGantt(this.KonvaRef, w, h);
  }

  private drawGantt(Konva: any, width: number, height: number) {
    if (!this.layer) return;

    const tasks = [
      { name: 'Analyse', start: 0, duration: 3 },
      { name: 'Design', start: 2, duration: 4 },
      { name: 'Dev', start: 5, duration: 6 },
      { name: 'Tests', start: 11, duration: 3 },
    ];

    const padding = 20;
    const rowHeight = 40;
    const maxTime = Math.max(...tasks.map(t => t.start + t.duration));
    const scale = (width - padding * 2) / Math.max(1, maxTime);

    tasks.forEach((task, i) => {
      const x = padding + task.start * scale;
      const y = padding + i * rowHeight;
      const w = Math.max(4, task.duration * scale - 2);

      const rect = new Konva.Rect({
        x,
        y: y + 8,
        width: w,
        height: 24,
        fill: '#5865f2',
        cornerRadius: 4,
        shadowColor: '#000',
        shadowBlur: 6,
        shadowOpacity: 0.15,
      });

      const label = new Konva.Text({
        x: padding,
        y: y,
        text: task.name,
        fontSize: 13,
        fill: '#ffffff',
      });

      this.layer.add(rect);
      this.layer.add(label);
    });

    // draw time axis
    for (let t = 0; t <= maxTime; t++) {
      const x = padding + t * scale;
      const line = new Konva.Line({
        points: [x, padding / 2 + 8, x, padding + tasks.length * rowHeight],
        stroke: '#2b2d31',
        strokeWidth: 1,
      });
      const txt = new Konva.Text({ x: x + 2, y: padding + tasks.length * rowHeight + 4, text: String(t), fontSize: 11, fill: '#b5bac1' });
      this.layer.add(line);
      this.layer.add(txt);
    }

    this.layer.draw();
  }
}

