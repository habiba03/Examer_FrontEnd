import { Component} from '@angular/core';
import { RouterLink} from "@angular/router";
import {NgClass, ViewportScroller} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeLink:string = 'home';

  setActive(link:string){
    this.activeLink = link;
  }

  constructor( private viewportScroller: ViewportScroller) {}

  scrollTo(sectionId: string) {
    this.viewportScroller.scrollToAnchor(sectionId);
  }
  scrollToTop(){
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
