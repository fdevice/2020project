import { Directive, Renderer2, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[respFocus]'
})
export class ElementFocusDirective implements OnInit {

  @Input('shouldFocus') shouldFocus: boolean;  // zmienna decydująca czy stosować dyrektywę w elemencie

  private element: HTMLInputElement;

  constructor(public renderer: Renderer2, public elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    if (this.shouldFocus) {
      this.renderer.selectRootElement(this.element).focus();
    }

  }

}