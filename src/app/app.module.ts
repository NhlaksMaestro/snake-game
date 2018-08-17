import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SnakePlaygroundComponent } from './snake-playground/snake-playground.component';

@NgModule({
  declarations: [
    AppComponent,
    SnakePlaygroundComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
