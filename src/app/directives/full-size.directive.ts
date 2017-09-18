import { Directive, ElementRef, Renderer, HostListener, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFullSize]'
})
export class FullSizeDirective {
  constructor(private el: ElementRef,
              private renderer: Renderer) { }

  ngAfterViewInit() {
    this.sizeElement();
  }

  windowDimensions() : Point {
    return new Point(
      window.innerWidth,
      window.innerHeight
    )
  }

  sizeElement() {
    const height = this.windowDimensions().y;
    this.renderer.setElementStyle(this.el.nativeElement, 'height', `${height}px`);
  }
}

class Point {
  x: number;
  y: number;

  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }
};