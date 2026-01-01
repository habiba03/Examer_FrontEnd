import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ViewportScroller} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller) {}

  ngAfterViewInit(): void {

    this.route.fragment.subscribe(fragment =>{
      if(fragment){
        this.viewportScroller.scrollToAnchor(fragment);
      }

    })
  }


}
