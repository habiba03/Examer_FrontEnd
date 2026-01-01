import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {ViewportScroller} from "@angular/common";

@Component({
  selector: 'app-footer',
  standalone: true,
    imports: [
        RouterLink
    ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  constructor(private viewportScroller: ViewportScroller ) {}

  scrollTo(sectionId: string) {
    this.viewportScroller.scrollToAnchor(sectionId);
  }
}
